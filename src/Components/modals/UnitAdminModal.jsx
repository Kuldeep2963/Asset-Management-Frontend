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

const UnitAdminModal = ({
  isOpen,
  onClose,
  isEditingUnitAdmin,
  newUnitAdmin,
  setNewUnitAdmin,
  units,
  handleAddUnitAdmin,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "lg" }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader bg="teal.600" color="white">
          {isEditingUnitAdmin ? "Edit Unit Administrator" : "Add Unit Administrator"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Select Unit</FormLabel>
              <Select
                placeholder="Select unit for this admin"
                value={newUnitAdmin.unit}
                onChange={(e) =>
                  setNewUnitAdmin({ ...newUnitAdmin, unit: e.target.value })
                }
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.organization_name})
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="Enter unit admin full name"
                value={newUnitAdmin.first_name}
                onChange={(e) =>
                  setNewUnitAdmin({
                    ...newUnitAdmin,
                    first_name: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Enter unit admin full name"
                value={newUnitAdmin.last_name}
                onChange={(e) =>
                  setNewUnitAdmin({
                    ...newUnitAdmin,
                    last_name: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter unit admin email"
                value={newUnitAdmin.email}
                onChange={(e) =>
                  setNewUnitAdmin({ ...newUnitAdmin, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <HStack spacing={3}>
                <Checkbox
                  isChecked={newUnitAdmin.can_manage_assets}
                  onChange={(e) =>
                    setNewUnitAdmin((prev) => ({
                      ...prev,
                      can_manage_assets: e.target.checked,
                    }))
                  }
                >
                  Asset Management
                </Checkbox>

                <Checkbox
                  isChecked={newUnitAdmin.can_manage_users}
                  onChange={(e) =>
                    setNewUnitAdmin((prev) => ({
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
          <Button colorScheme="teal" onClick={handleAddUnitAdmin}>
            {isEditingUnitAdmin ? "Update Unit Admin" : "Create Unit Admin"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnitAdminModal;
