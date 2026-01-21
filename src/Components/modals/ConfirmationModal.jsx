import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  colorScheme = "red",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
        </ModalHeader>
        <ModalCloseButton top={3} />
        <ModalBody py={6}>
          <VStack spacing={4} align="center" textAlign="center">
            <Icon as={FiAlertTriangle} boxSize={12} color={`${colorScheme}.500`} />
            <Text color="gray.600" fontSize="md">
              {message}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderBottomRadius="xl" py={3}>
          <Button variant="ghost" mr={3} onClick={onClose} size="sm">
            {cancelText}
          </Button>
          <Button
            colorScheme={colorScheme}
            onClick={() => {
              onConfirm();
              // onClose is usually handled by the parent after confirm
            }}
            isLoading={isLoading}
            size="sm"
            px={6}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
