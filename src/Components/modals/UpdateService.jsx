import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import api from "../../services/api";

const UpdateService = ({ service, isOpen, onClose, onSuccess, serviceUsers = [] }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    service_type: "",
    priority: "",
    remarks: "",
    status: "",
    service_user: "",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        service_type: service.service_type || "",
        priority: service.priority || "",
        remarks: service.remarks || "",
        status: service.status || "",
        service_user: service.service_user?.id || service.service_user || "",
      });
    }
  }, [service, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        service_user_id: formData.service_user ? parseInt(formData.service_user) : null,
      };
      delete dataToSubmit.service_user; // Remove the original field to avoid confusion

      await api.patch(`/api/asset-service/${service.id}/update-service/`, dataToSubmit);
      toast({
        title: "Success",
        description: "Service updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Update failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Service</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Service Type</FormLabel>
              <Select
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
              >
                <option value="maintenance">Preventive Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="calibration">Calibration</option>
                <option value="installation">Installation</option>
                <option value="upgrade">Upgrade</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Assign To</FormLabel>
              <Select
                name="service_user"
                value={formData.service_user}
                onChange={handleInputChange}
                placeholder="Select technician"
              >
                {serviceUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Priority</FormLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Remarks / Description</FormLabel>
              <Textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Describe the service details..."
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleUpdate}
            isLoading={loading}
            loadingText="Updating..."
          >
            Update Service
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateService;
