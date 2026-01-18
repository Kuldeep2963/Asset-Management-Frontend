import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Select,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Flex,
} from "@chakra-ui/react";

import { FiPlus, FiSave, FiTrash2, FiSettings } from "react-icons/fi";

const Settings = () => {
  const BACKEND_API = import.meta.env.VITE_API_URL;
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");

  const [assetSchema, setAssetSchema] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    category: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData?.unit?.id) fetchAssetSchema();
  }, [userData]);

  // Load user from storage
  const loadUserData = () => {
    let storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  const getAccessToken = () => {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  };

  const fetchAssetSchema = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await fetch(
        `${BACKEND_API}/api/units/${userData.unit.id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const schema = data.asset_schema || [];
      setAssetSchema(schema);

      const uniqueCategories = [
        ...new Set(schema.map((field) => field.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: "Error loading schema",
        status: "error",
      });
    }
  };

  // ADD FIELD WITH API
  const handleAddField = async () => {
    if (!newField.key || !newField.label || !newField.category) {
      return toast({
        title: "Validation Error",
        description: "Please fill all fields",
        status: "warning",
      });
    }

    const exists = assetSchema.some((f) => f.key === newField.key);
    if (exists) {
      return toast({
        title: "Duplicate Key",
        description: "This key already exists",
        status: "warning",
      });
    }

    const updatedSchema = [...assetSchema, { ...newField }];

    try {
      const accessToken = getAccessToken();

      const res = await fetch(
        `${BACKEND_API}/api/units/${userData.unit.id}/update-asset-schema/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ asset_schema: updatedSchema }),
        }
      );

      if (!res.ok) throw new Error("Failed to save new field");

      setAssetSchema(updatedSchema);

      toast({
        title: "Field Added",
        status: "success",
      });

      setNewField({ key: "", label: "", type: "text", category: "" });
      setNewCategory("");
      setShowNewCategoryInput(false);
    } catch (error) {
      toast({
        title: "Error Adding Field",
        description: error.message,
        status: "error",
      });
    }
  };

  // REMOVE FIELD WITH API
  const handleRemoveField = async (index) => {
    const updatedSchema = assetSchema.filter((_, i) => i !== index);

    try {
      const accessToken = getAccessToken();

      const res = await fetch(
        `${BACKEND_API}/api/units/${userData.unit.id}/update-asset-schema/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ asset_schema: updatedSchema }),
        }
      );

      if (!res.ok) throw new Error("Failed to remove field");

      setAssetSchema(updatedSchema);

      toast({
        title: "Field Removed",
        status: "info",
      });
    } catch (error) {
      toast({
        title: "Error Removing Field",
        description: error.message,
        status: "error",
      });
    }
  };

  // MANUAL SAVE BUTTON
  const handleSaveSchema = async () => {
    setIsSaving(true);
    try {
      const accessToken = getAccessToken();

      const res = await fetch(
        `${BACKEND_API}/api/units/${userData.unit.id}/update-asset-schema/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ asset_schema: assetSchema }),
        }
      );

      if (!res.ok) throw new Error("Failed to save schema");

      toast({
        title: "Schema Saved",
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Error Saving Schema",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Dropdown" },
  ];

  return (
    <Box bg={bgColor} minH="100vh" p={{ base: 4, md: 8 }} pt={{ base: 0, md: 8 }}>
      <Container maxW="6xl">
        <VStack spacing={6} align="stretch">
          <HStack spacing={3}>
            <Icon as={FiSettings} boxSize={8} color="blue.500" />
            <Box>
              <Heading size="lg" color={headingColor}>
                Settings
              </Heading>
              <Text fontSize="sm" color={textColor}>
                Manage custom fields for assets
              </Text>
            </Box>
          </HStack>

          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Custom fields added here will appear in the Add Asset form.
            </AlertDescription>
          </Alert>

          {/* ADD FIELD SECTION */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Add Custom Field</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Field Key</FormLabel>
                    <Input
                      value={newField.key}
                      onChange={(e) =>
                        setNewField({ ...newField, key: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Field Label</FormLabel>
                    <Input
                      value={newField.label}
                      onChange={(e) =>
                        setNewField({ ...newField, label: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      value={newField.type}
                      onChange={(e) =>
                        setNewField({ ...newField, type: e.target.value })
                      }
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                {/* CATEGORY */}
                <HStack spacing={4} w="100%">
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={newField.category}
                      onChange={(e) => {
                        if (e.target.value === "other") {
                          setShowNewCategoryInput(true);
                          setNewField({ ...newField, category: "" });
                        } else {
                          setShowNewCategoryInput(false);
                          setNewField({
                            ...newField,
                            category: e.target.value,
                          });
                        }
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>

                  {showNewCategoryInput && (
                    <FormControl>
                      <FormLabel>New Category</FormLabel>
                      <Input
                        placeholder="Enter category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onBlur={() => {
                          if (newCategory.trim()) {
                            setCategories((prev) => [
                              ...prev,
                              newCategory.trim(),
                            ]);
                            setNewField({
                              ...newField,
                              category: newCategory.trim(),
                            });
                          }
                        }}
                      />
                    </FormControl>
                  )}
                </HStack>

                <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleAddField}>
                  Add Field
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* SCHEMA TABLE */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between">
                <Heading size="md">Current Asset Schema</Heading>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="green"
                  onClick={handleSaveSchema}
                  isLoading={isSaving}
                >
                  Save Schema
                </Button>
              </Flex>
            </CardHeader>
            <Divider />
            <CardBody>
              {assetSchema.length === 0 ? (
                <Text textAlign="center">No custom fields yet.</Text>
              ) : (
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Key</Th>
                      <Th>Label</Th>
                      <Th>Type</Th>
                      <Th>Category</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {assetSchema.map((field, index) => (
                      <Tr key={index}>
                        <Td>{field.key}</Td>
                        <Td>{field.label}</Td>
                        <Td>
                          <Badge>{field.type}</Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="purple">{field.category}</Badge>
                        </Td>
                        <Td textAlign="right">
                          <IconButton
                            icon={<FiTrash2 />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveField(index)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Settings;
