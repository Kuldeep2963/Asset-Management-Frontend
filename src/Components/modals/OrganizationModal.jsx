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

const OrganizationModal = ({
  isOpen,
  onClose,
  isEditingOrg,
  newOrganization,
  setNewOrganization,
  handleAddOrganization,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader bg="teal.600" color="white">
          {isEditingOrg ? "Edit Organization" : "Add New Organization"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Organization Name</FormLabel>
              <Input
                placeholder="Enter organization name"
                value={newOrganization.name}
                onChange={(e) =>
                  setNewOrganization({
                    ...newOrganization,
                    name: e.target.value,
                  })
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleAddOrganization}>
            {isEditingOrg ? "Update Organization" : "Create Organization"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrganizationModal;
