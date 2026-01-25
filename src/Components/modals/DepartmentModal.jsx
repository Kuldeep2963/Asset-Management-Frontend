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
} from "@chakra-ui/react";

const DepartmentModal = ({
  isOpen,
  onClose,
  isEditingDept,
  userRole,
  newDepartment,
  setNewDepartment,
  units,
  userData,
  handleAddDepartment,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "lg" }}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader bg="teal.600" color="white">
          {isEditingDept ? "Edit Department" : "Add Department"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Unit</FormLabel>
              <Select
                placeholder="Select Unit"
                value={newDepartment.unit}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
                    unit: e.target.value,
                  })
                }
                isDisabled={userRole === "unit_admin"}
              >
                {userRole === "org_admin" &&
                  units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                {userRole === "unit_admin" && userData?.unit && (
                  <option value={userData.unit.id}>
                    {userData.unit.name}
                  </option>
                )}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Department Name</FormLabel>
              <Input
                placeholder="Enter department name"
                value={newDepartment.name}
                onChange={(e) =>
                  setNewDepartment({
                    ...newDepartment,
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
          <Button colorScheme="teal" onClick={handleAddDepartment}>
            {isEditingDept ? "Update Department" : "Add Department"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DepartmentModal;
