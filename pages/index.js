import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TodoServices } from '../services/todos';

import Head from 'next/head';
import {
  Container,
  IconButton,
  Input,
  Flex,
  Text,
  Box,
  Heading,
  Card,
  CardBody,
  Center,
  Stack,
  StackDivider,
  Spacer,
  Editable,
  EditablePreview,
  EditableInput,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useDisclosure,
  FormControl,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';
import { BsPlusCircle, BsTrash } from 'react-icons/bs';

export default function Home() {
  const todoServices = new TodoServices();
  const queryClient = useQueryClient();

  const [todoId, setTodoId] = useState('');
  const [todoText, setTodoText] = useState('');
  const [isMsgError, setIsMsgError] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  // Queries
  const { isLoading, isError, isFetching, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: todoServices.getTodos,
    staleTime: 15000,
    refetchInterval: 15000,
  });

  // Mutations
  const postTodo = useMutation({
    mutationFn: todoServices.postTodo,
    onMutate: async newTodo => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Remove local state so that server state is taken instead
      setTodoText('');

      // Optimistically update to the new value
      if (previousTodos) {
        newTodo = { _id: new Date().toISOString(), ...newTodo };
        const todoAdded = [newTodo].concat(previousTodos.todos);
        queryClient.setQueryData(['todos'], {
          todos: [...todoAdded],
        });
      }

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: context => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const updateTodo = useMutation({
    mutationFn: todoServices.updateTodo,
    onMutate: async newTodo => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodo = queryClient.getQueryData(['todos']);

      // Optimistically update to the new value
      const todoUpdated = previousTodo.todos.map(item => {
        if (item._id === newTodo._id) {
          return newTodo;
        }
        return item;
      });
      queryClient.setQueryData(['todos'], {
        todos: [...todoUpdated],
      });

      // Return a context with the previous
      return { previousTodo };
    },
    onError: context => {
      queryClient.setQueryData(['todos'], context.previousTodo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: todoServices.deleteTodo,
    onMutate: async todoId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the previous value
      const previousTodo = queryClient.getQueryData(['todos']);

      // Optimistically update to the new value
      const todoDeleted = previousTodo.todos.filter(item => item._id != todoId);
      queryClient.setQueryData(['todos'], {
        todos: [...todoDeleted],
      });

      // Return a context with the previous
      return { previousTodo };
    },
    onError: context => {
      queryClient.setQueryData(['todos'], context.previousTodo);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Actions
  const openModal = todoId => {
    setTodoId(todoId);
    onOpen();
  };

  const closeModal = () => {
    setTodoId('');
    onClose();
  };

  const onChangeTodoText = e => {
    setTodoText(e.target.value);
    if (e.target.value) {
      setIsMsgError(false);
    } else {
      setIsMsgError(true);
    }
  };

  const onSubmit = event => {
    event.preventDefault();
    if (todoText) {
      postTodo.mutate({ text: todoText });
      setIsMsgError(false);
    } else {
      setIsMsgError(true);
    }
  };

  // Components
  const ModalDelete = () => {
    return (
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeModal}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Todo
            </AlertDialogHeader>

            <AlertDialogBody>
              {`Are you sure? You can't undo this action afterwards.`}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeModal}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  deleteTodo.mutate(todoId);
                  closeModal();
                }}
                ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    );
  };

  const ItemTodo = ({ item }) => {
    return (
      <Box>
        <Flex>
          <Editable
            defaultValue={item.text}
            onSubmit={value => {
              updateTodo.mutate({
                _id: item._id,
                text: value,
              });
            }}>
            <EditablePreview />
            <EditableInput />
          </Editable>
          <Spacer />
          <IconButton
            colorScheme="red"
            aria-label="Delete"
            size="xs"
            icon={<BsTrash />}
            onClick={() => openModal(item._id)}
          />
        </Flex>
      </Box>
    );
  };

  const Message = ({ children }) => {
    return (
      <CardBody>
        <Center>{children}</Center>
      </CardBody>
    );
  };

  return (
    <>
      <Head>
        <title>Todo App</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="application-name" content="Todo App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Todo App" />
        <meta
          name="description"
          content="A todo app built using Next.js and React Query for efficient data management and real-time updates."
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <Container marginY={16}>
        <Container>
          <Heading as="h4" size="md">
            Todo App
          </Heading>
          <Text fontSize="xs">Built using Next.js and React Query</Text>
        </Container>
        <Box h={5} />
        <Container>
          <form onSubmit={onSubmit}>
            <Flex gap="2">
              <FormControl isInvalid={isMsgError}>
                <Input
                  value={todoText}
                  placeholder="Enter todo"
                  onChange={onChangeTodoText}
                />
                {isMsgError && (
                  <FormErrorMessage>Todo is required.</FormErrorMessage>
                )}
              </FormControl>
              <IconButton
                type="submit"
                colorScheme="teal"
                aria-label="Add"
                icon={<BsPlusCircle />}
              />
            </Flex>
          </form>
        </Container>
        <Box h={5} />
        <Container>
          <Card>
            {isLoading ? (
              <Message>
                <Spinner />
                <Box w={2} />
                <Text>Loading...</Text>
              </Message>
            ) : isError ? (
              <Message>{`Error: ${error.message}`}</Message>
            ) : data ? (
              <>
                {isFetching && (
                  <Message>
                    <Spinner />
                    <Box w={2} />
                    <Text>Refreshing...</Text>
                  </Message>
                )}
                <CardBody>
                  <Stack divider={<StackDivider />} spacing="4">
                    {data.todos?.length > 0 ? (
                      data.todos.map((item, index) => (
                        <ItemTodo item={item} key={index} />
                      ))
                    ) : (
                      <Message>{`It's empty in here`}</Message>
                    )}
                  </Stack>
                </CardBody>
              </>
            ) : null}
          </Card>
        </Container>
      </Container>
      <ModalDelete />
    </>
  );
}
