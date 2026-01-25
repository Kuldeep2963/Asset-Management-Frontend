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
  Select,
  HStack,
  Checkbox,
} from "@chakra-ui/react";

const AdminModal = ({
  isOpen,
  onClose,
  isEditingAdmin,
  newAdmin,
  setNewAdmin,
  organizations,
  handleAddAdmin,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "lg" }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader bg="teal.600" color="white">
          {isEditingAdmin ? "Edit Organization Admin" : "Add Organization Admin"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Select Organization</FormLabel>
              <Select
                placeholder="Select organization"
                value={newAdmin.organization}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, organization: e.target.value })
                }
                isDisabled={isEditingAdmin}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Admin First Name</FormLabel>
              <Input
                placeholder="Enter admin first name"
                value={newAdmin.first_name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, first_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Admin Last Name</FormLabel>
              <Input
                placeholder="Enter admin last name"
                value={newAdmin.last_name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, last_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter admin email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <HStack spacing={3}>
                <Checkbox
                  isChecked={newAdmin.can_manage_assets}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({
                      ...prev,
                      can_manage_assets: e.target.checked,
                    }))
                  }
                >
                  Asset Management
                </Checkbox>

                <Checkbox
                  isChecked={newAdmin.can_manage_users}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({
                      ...prev,
                      can_manage_users: e.target.checked,
                    }))
                  }
                >
                  User Management
                </Checkbox>
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleAddAdmin}>
            {isEditingAdmin ? "Update Admin" : "Add Admin"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdminModal;
