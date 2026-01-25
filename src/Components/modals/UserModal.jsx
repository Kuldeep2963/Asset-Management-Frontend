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
  Checkbox,
  Text,
} from "@chakra-ui/react";

const UserModal = ({
  isOpen,
  onClose,
  isEditingUser,
  userRole,
  newUser,
  setNewUser,
  units,
  selectedUnitDepartments,
  handleAddUser,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "lg" }}
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent>
        <ModalHeader borderTopRadius={"md"} bg="teal.600" color="white">
          {isEditingUser ? "Edit User" : "Add New User"}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={4}>
            {(userRole === "org_admin" || userRole === "unit_admin") && (
              <FormControl isRequired>
                <FormLabel>Select Unit</FormLabel>
                <Select
                  placeholder="Select unit"
                  value={newUser.unit}
                  onChange={(e) =>
                    setNewUser({ ...newUser, unit: e.target.value })
                  }
                  isDisabled={userRole === "unit_admin"}
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}{" "}
                      {unit.organization_name &&
                        `(${unit.organization_name})`}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="Enter user full name"
                value={newUser.first_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                placeholder="Enter user full name"
                value={newUser.last_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter user email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input
                placeholder="Enter phone number"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                placeholder="Select role"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="service_user">Service User</option>
                <option value="viewer">Viewer</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Department(s)</FormLabel>

              {userRole === "org_admin" && !newUser.unit ? (
                <Text fontSize="sm" color="gray.500">
                  Please select a unit first
                </Text>
              ) : (
                <VStack align="start" spacing={2}>
                  {selectedUnitDepartments.map((dept) => (
                    <Checkbox
                      key={dept.id}
                      isChecked={newUser.departments.includes(dept.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewUser({
                            ...newUser,
                            departments: [...newUser.departments, dept.id],
                          });
                        } else {
                          setNewUser({
                            ...newUser,
                            departments: newUser.departments.filter(
                              (id) => id !== dept.id,
                            ),
                          });
                        }
                      }}
                    >
                      {dept.name}
                    </Checkbox>
                  ))}
                </VStack>
              )}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleAddUser}>
            {isEditingUser ? "Update User" : "Add User"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
