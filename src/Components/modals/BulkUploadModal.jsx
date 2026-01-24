import React, { useState, useEffect } from "react";
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
  useToast,
  Input,
  Box,
  HStack,
  Select,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { FiUpload, FiDownload, FiFileText } from "react-icons/fi";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BulkUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [loadingUnits, setLoadingUnits] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (user?.role === "org_admin") {
        fetchUnits();
      } else if (user?.role === "unit_admin" && user?.unit?.id) {
        setSelectedUnitId(user.unit.id);
      }
    }
  }, [isOpen, user]);

  const fetchUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await api.get("/api/units/");
      if (response.data.results) {
        setUnits(response.data.results);
      } else {
        setUnits(response.data || []);
      }
    } catch (error) {
      toast({
        title: "Error fetching units",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const downloadTemplate = async () => {
    if (!selectedUnitId) {
      toast({
        title: "Please select a unit",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await api.get(`/api/assets/bulk-upload-template/?unit_id=${selectedUnitId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "asset_bulk_upload_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error downloading template",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedUnitId) {
      toast({
        title: "Please select a unit",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!file) {
      toast({
        title: "Please select a file",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post(`/api/assets/bulk-upload/?unit_id=${selectedUnitId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Upload successful",
        description: "Assets have been uploaded successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onUploadSuccess();
      onClose();
      setFile(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.detail || error.message || "An error occurred during upload.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader borderBottomWidth="1px" py={4}>
          Bulk Upload Assets
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {user?.role === "org_admin" && (
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="bold">Select Unit</FormLabel>
                <HStack>
                  <Select
                    placeholder="Select Unit"
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    isDisabled={loadingUnits}
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </Select>
                  {loadingUnits && <Spinner size="sm" />}
                </HStack>
              </FormControl>
            )}

            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="blue.50"
              _dark={{ bg: "blue.900", borderColor: "blue.700" }}
              borderColor="blue.200"
            >
              <HStack spacing={3}>
                <Icon as={FiFileText} color="blue.500" />
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="bold">
                    Download Template
                  </Text>
                  <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                    Use our template to ensure your data is correctly formatted.
                  </Text>
                </Box>
                <Button
                  leftIcon={<FiDownload />}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                  onClick={downloadTemplate}
                  isDisabled={!selectedUnitId}
                >
                  Download
                </Button>
              </HStack>
            </Box>

            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" fontWeight="bold">
                Select File
              </Text>
              <Input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                p={1}
              />
              <Text fontSize="xs" color="gray.500">
                Accepted formats: .csv, .xlsx, .xls
              </Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" _dark={{ bg: "gray.700" }} borderBottomRadius="xl" py={3}>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={uploading}>
            Cancel
          </Button>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="green"
            onClick={handleUpload}
            isLoading={uploading}
            loadingText="Uploading..."
            isDisabled={!file || !selectedUnitId}
          >
            Upload Assets
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BulkUploadModal;
