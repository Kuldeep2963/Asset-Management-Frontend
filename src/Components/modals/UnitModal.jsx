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
  VStack,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

const UnitModal = ({
  isOpen,
  onClose,
  isEditingUnit,
  newUnit,
  setNewUnit,
  handleAddUnit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "lg" }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader bg="teal.600" color="white">
          {isEditingUnit ? "Edit Unit" : "Add New Unit"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Unit Name</FormLabel>
              <Input
                placeholder="Enter unit name"
                value={newUnit.name}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, name: e.target.value })
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleAddUnit}>
            {isEditingUnit ? "Update Unit" : "Create Unit"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnitModal;
