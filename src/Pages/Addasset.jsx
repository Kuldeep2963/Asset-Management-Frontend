import React, { useState, useEffect } from "react";
import {
  Box,
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
  Textarea,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Collapse,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Badge,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import {
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiUpload,
  FiPackage,
  FiXCircle,
  FiEdit,
  FiTool,
} from "react-icons/fi";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import AssignContractModal from "../Components/modals/AssignContractModal";
import { useAuth } from "../context/AuthContext";

const AddAsset = () => {
  const { user } = useAuth();
  const BACKEND_API = import.meta.env.VITE_API_URL;
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assetId = searchParams.get("id");
  const viewMode = searchParams.get("view") === "true";

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const primaryColor = useColorModeValue("blue.600", "blue.400");
  const successColor = useColorModeValue("green.500", "green.400");

  // Asset schema state
  const [assetSchema, setAssetSchema] = useState([]);
  const [customFields, setCustomFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Departments, setDepartments] = useState([]);
  const [Units, setUnits] = useState([]);
  const [loading, setLoading] = useState({
    departments: false,
    asset: false,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetForAMC, setSelectedAssetForAMC] = useState(null);
  const [amcDetails, setAmcDetails] = useState(null);

  // Default fields state
  const [defaultFields, setDefaultFields] = useState({
    organization: "",
    asset_id: "",
    asset_name: "",
    category: "",
    unit: "",
    asset_type: "",
    department: "",
    purchase_date: null,
    installation_date: null,
    warranty_expiry_date: null,
    license_expiry_date: null,
    calibration_due_date: null,
    last_calibrated_at: null,
    last_serviced_at: null,
    next_service_due: null,
  });

  useEffect(() => {
    if (user) {
      setDefaultFields((prev) => ({
        ...prev,
        organization: user.organization?.id || "",
      }));
    }
  }, [user]);

  // Collapse states
  const [openSections, setOpenSections] = useState({
    basic: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (user?.role === "org_admin") {
      fetchUnits();
    }
  }, [user]);

  useEffect(() => {
    if (user?.unit?.id && !assetId) {
      fetchAssetSchema(user.unit.id);
      setDefaultFields((prev) => ({ ...prev, unit: user.unit.id }));
      fetchDepartments(user.unit.id);
    }
  }, [user]);

  useEffect(() => {
    if (defaultFields.unit && user?.role === "org_admin" && !assetId) {
      fetchDepartments(defaultFields.unit);
      fetchAssetSchema(defaultFields.unit);
    }
  }, [defaultFields.unit]);

  useEffect(() => {
    if (assetId && user) {
      setIsEditMode(true);
      fetchAssetData(assetId);
    }
  }, [assetId, user]);

  const fetchContractDetails = async (contractId) => {
    try {
      const response = await api.get(`/api/contracts/${contractId}/`);
      setAmcDetails(response.data);
    } catch (error) {
      console.error("Error fetching contract details:", error);
    }
  };

  const fetchAssetData = async (id) => {
    setLoading((prev) => ({ ...prev, asset: true }));
    try {
      const response = await api.get(`/api/assets/${id}/`);
      const data = response.data;

      setDefaultFields({
        organization: data.organization || "",
        asset_id: data.asset_id || "",
        asset_name: data.asset_name || "",
        category: data.category || "",
        unit: data.unit || "",
        asset_type: data.asset_type || "",
        department: data.department || "",
        purchase_date: data.purchase_date || "",
        installation_date: data.installation_date || "",
        warranty_expiry_date: data.warranty_expiry_date || "",
        license_expiry_date: data.license_expiry_date || "",
        calibration_due_date: data.calibration_due_date || "",
        last_calibrated_at: data.last_calibrated_at || "",
        last_serviced_at: data.last_serviced_at || "",
        next_service_due: data.next_service_due || "",
      });

      if (data.amc_contract) {
        fetchContractDetails(data.amc_contract);
      }

      if (data.attributes || data.custom_fields) {
        setCustomFields(data.attributes || data.custom_fields || {});
      }

      if (data.unit) {
        fetchDepartments(data.unit);
        fetchAssetSchema(data.unit);
      }
    } catch (error) {
      toast({
        title: "Error loading asset",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, asset: false }));
    }
  };

  const fetchAssetSchema = async (unitId) => {
    try {
      const response = await api.get(`/api/units/${unitId}/`);
      const data = response.data;
      const schema = data.asset_schema || [];
      setAssetSchema(schema);

      const groupedFields = {};
      schema.forEach((field) => {
        if (!groupedFields[field.category]) {
          groupedFields[field.category] = [];
        }
        groupedFields[field.category].push(field);
      });

      if (!assetId) {
        const initialCustomFields = {};
        schema.forEach((field) => {
          initialCustomFields[field.key] = "";
        });
        setCustomFields(initialCustomFields);
      }
    } catch (error) {
      toast({
        title: "Error loading schema",
        description: "Failed to load custom fields",
        status: "error",
      });
    }
  };
  const fetchDepartments = async (unitId) => {
    setLoading((prev) => ({ ...prev, departments: true }));
    try {
      const response = await api.get(`/api/departments/?unit_id=${unitId}`);
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast({
        title: "Error loading departments",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const fetchUnits = async () => {
    setLoading((prev) => ({ ...prev, units: true }));
    try {
      const response = await api.get(`/api/units/`);
      setUnits(response.data || []);
    } catch (error) {
      console.error("Error loading units:", error);
      toast({
        title: "Error loading units",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, units: false }));
    }
  };
  const groupFieldsByCategory = () => {
    const grouped = {};
    assetSchema.forEach((field) => {
      if (!grouped[field.category]) {
        grouped[field.category] = [];
      }
      grouped[field.category].push(field);
    });
    return grouped;
  };

  const handleCustomFieldChange = (key, value) => {
    setCustomFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDefaultFieldChange = (e) => {
    const { name, value } = e.target;
    setDefaultFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <FormControl key={field.key}>
            <FormLabel>{field.label}</FormLabel>
            <Input
              value={customFields[field.key] || ""}
              onChange={(e) =>
                handleCustomFieldChange(field.key, e.target.value)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
              isReadOnly={viewMode}
            />
          </FormControl>
        );

      case "number":
        return (
          <FormControl key={field.key}>
            <FormLabel>{field.label}</FormLabel>
            <NumberInput
              value={customFields[field.key] || ""}
              onChange={(value) => handleCustomFieldChange(field.key, value)}
              isReadOnly={viewMode}
            >
              <NumberInputField
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
              {!viewMode && (
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              )}
            </NumberInput>
          </FormControl>
        );

      case "date":
        return (
          <FormControl key={field.key}>
            <FormLabel>{field.label}</FormLabel>
            <Input
              type="date"
              value={customFields[field.key] || ""}
              onChange={(e) =>
                handleCustomFieldChange(field.key, e.target.value)
              }
              isReadOnly={viewMode}
            />
          </FormControl>
        );

      case "textarea":
        return (
          <FormControl key={field.key}>
            <FormLabel>{field.label}</FormLabel>
            <Textarea
              value={customFields[field.key] || ""}
              onChange={(e) =>
                handleCustomFieldChange(field.key, e.target.value)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
              isReadOnly={viewMode}
            />
          </FormControl>
        );

      case "select":
        return (
          <FormControl key={field.key}>
            <FormLabel>{field.label}</FormLabel>
            <Select
              value={customFields[field.key] || ""}
              onChange={(e) =>
                handleCustomFieldChange(field.key, e.target.value)
              }
              placeholder={`Select ${field.label.toLowerCase()}`}
              isDisabled={viewMode}
            >
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const assetData = {
        ...defaultFields,
        attributes: customFields,
      };

      const response = isEditMode
        ? await api.put(`/api/assets/${assetId}/`, assetData)
        : await api.post(`/api/assets/`, assetData);

      const data = response.data;

      toast({
        title: isEditMode ? "Asset Updated" : "Asset Added",
        description: `Asset has been successfully ${
          isEditMode ? "updated" : "added to the system"
        }.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (isEditMode) {
        navigate("/assets");
      } else {
        setDefaultFields({
          organization: user?.organization?.id || "",
          asset_id: "",
          asset_name: "",
          category: "",
          unit: user?.unit?.id || "",
          asset_type: "",
          department: "",
          purchase_date: null,
          installation_date: null,
          warranty_expiry_date: null,
          license_expiry_date: null,
          calibration_due_date: null,
          last_calibrated_at: null,
          last_serviced_at: null,
          next_service_due: null,
        });

        const initialCustomFields = {};
        assetSchema.forEach((field) => {
          initialCustomFields[field.key] = "";
        });
        setCustomFields(initialCustomFields);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || error.message || `Failed to ${isEditMode ? "update" : "add"} asset`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading.asset) {
    return (
      <Box
        bg={bgColor}
        minH="100vh"
        pt="60px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading asset data...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor}  minH="calc(100vh - 180px)" p={{ base: 4, md: 8 }} pt={{ base: 0, md: 8 }} mb={{base:"50px",md:"0"}}>
      {/* Header */}
      <HStack justify={"space-between"}>
        <VStack spacing={2} align="stretch" mb={8}>
          <Heading size="lg" color={headingColor}>
            {viewMode
              ? "View Asset Details"
              : isEditMode
              ? "Edit Asset"
              : "Add New Asset"}
          </Heading>
          <Text fontSize={"sm"} color={textColor}>
            {viewMode
              ? "Asset details are displayed below in read-only mode."
              : isEditMode
              ? "Update the asset details below."
              : "Fill in the custom fields below to register a new asset in the system."}
          </Text>
        </VStack>
        <>
  {/* Mobile: VStack */}
  <VStack 
    spacing={3} 
    w="full"
    display={{ base: "flex", md: "none" }}
  >
    {viewMode && (
      <Button
        colorScheme="teal"
        leftIcon={<FiTool />}
      size="sm"

        onClick={() => {
          setSelectedAssetForAMC({
            id: assetId,
            asset_name: defaultFields.asset_name,
            asset_id: defaultFields.asset_id,
          });
          setShowAssignModal(true);
        }}
      >
        <Text>{amcDetails ? "Update AMC/CMC" : "Assign AMC/CMC"}</Text>
      </Button>
    )}
    <Button
      colorScheme="red"
      variant="outline"
            size="sm"

      leftIcon={<FiXCircle />}
      onClick={() => navigate("/assets")}
      
    >
      {viewMode ? "Close" : "Cancel"}
    </Button>
  </VStack>

  {/* Desktop: HStack */}
  <HStack 
    spacing={3} 
    ml={viewMode ? "auto" : 0}
    display={{ base: "none", md: "flex" }}
  >
    {viewMode && (
      <Button
        colorScheme="teal"
      size="sm"

        leftIcon={<FiTool />}
        onClick={() => {
          setSelectedAssetForAMC({
            id: assetId,
            asset_name: defaultFields.asset_name,
            asset_id: defaultFields.asset_id,
          });
          setShowAssignModal(true);
        }}
      >
        <Text>{amcDetails ? "Update AMC/CMC" : "Assign AMC/CMC"}</Text>
      </Button>
    )}
    <Button
      colorScheme="red"
      variant="outline"
      size="sm"
      leftIcon={<FiXCircle />}
      onClick={() => navigate("/assets")}
    >
      {viewMode ? "Close" : "Cancel"}
    </Button>
  </HStack>
</>
      </HStack>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Basic Information Card with Default Fields */}
          <Card
            bg={cardBg}
            border="1px"
            borderColor={openSections.basic ? "blue.200" : borderColor}
            boxShadow={openSections.basic ? "md" : "sm"}
            transition="all 0.3s"
          >
            <CardHeader
              cursor="pointer"
              onClick={() => toggleSection("basic")}
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              borderRadius="lg"
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon as={FiPackage} color="blue.500" boxSize={5} />
                  <Box>
                    <Heading size={{base:"sm",md:"md"}} color={headingColor}>
                      Basic Information
                    </Heading>
                    <Text fontSize={{base:"xs",md:"sm"}} color={textColor}>
                      Required asset details
                    </Text>
                  </Box>
                </HStack>
                <Icon
                  as={openSections.basic ? FiChevronUp : FiChevronDown}
                  color={textColor}
                  boxSize={5}
                />
              </Flex>
            </CardHeader>

            <Collapse in={openSections.basic} animateOpacity>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Asset ID</FormLabel>
                    <Input
                      name="asset_id"
                      value={defaultFields.asset_id}
                      onChange={handleDefaultFieldChange}
                      placeholder="Enter asset ID"
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Asset Name</FormLabel>
                    <Input
                      name="asset_name"
                      value={defaultFields.asset_name}
                      onChange={handleDefaultFieldChange}
                      placeholder="Enter asset name"
                      isReadOnly={viewMode}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Asset Type</FormLabel>
                    <Input
                      name="asset_type"
                      value={defaultFields.asset_type}
                      onChange={handleDefaultFieldChange}
                      placeholder="Enter asset type"
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Input
                      name="category"
                      value={defaultFields.category}
                      onChange={handleDefaultFieldChange}
                      placeholder="Enter category"
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  {user?.role === "org_admin" ? (
                    <FormControl isRequired>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        name="unit"
                        value={defaultFields.unit}
                        onChange={handleDefaultFieldChange}
                        placeholder="Select unit"
                        isDisabled={loading.units || viewMode}
                      >
                        {Units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl isRequired>
                      <FormLabel>Unit ID</FormLabel>
                      <Input
                        name="unit"
                        value={defaultFields.unit}
                        onChange={handleDefaultFieldChange}
                        placeholder="Unit ID"
                        readOnly
                        bg={useColorModeValue("gray.50", "gray.700")}
                      />
                    </FormControl>
                  )}
                  <FormControl isRequired>
                    <FormLabel>Department</FormLabel>
                    <Select
                      name="department"
                      value={defaultFields.department}
                      onChange={handleDefaultFieldChange}
                      placeholder="Select department"
                      isDisabled={
                        loading.departments || !defaultFields.unit || viewMode
                      }
                    >
                      {Departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Purchase Date</FormLabel>
                    <Input
                      type="date"
                      name="purchase_date"
                      value={defaultFields.purchase_date}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Installation Date</FormLabel>
                    <Input
                      type="date"
                      name="installation_date"
                      value={defaultFields.installation_date}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Warranty Expiry Date</FormLabel>
                    <Input
                      type="date"
                      name="warranty_expiry_date"
                      value={defaultFields.warranty_expiry_date}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>License Expiry Date</FormLabel>
                    <Input
                      type="date"
                      name="license_expiry_date"
                      value={defaultFields.license_expiry_date}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Calibration Due Date</FormLabel>
                    <Input
                      type="date"
                      name="calibration_due_date"
                      value={defaultFields.calibration_due_date}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Last Calibrated At</FormLabel>
                    <Input
                      type="date"
                      name="last_calibrated_at"
                      value={defaultFields.last_calibrated_at}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Last Serviced At</FormLabel>
                    <Input
                      type="date"
                      name="last_serviced_at"
                      value={defaultFields.last_serviced_at}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Next Service Due</FormLabel>
                    <Input
                      type="date"
                      name="next_service_due"
                      value={defaultFields.next_service_due}
                      onChange={handleDefaultFieldChange}
                      isReadOnly={viewMode}
                    />
                  </FormControl>
                </SimpleGrid>

                {amcDetails && (
                  <Box mt={8}>
                    <Divider mb={6} />
                    <Heading
                      size="sm"
                      mb={4}
                      color="blue.500"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={FiTool} /> AMC / CMC Details
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          Contract Number
                        </Text>
                        <Text fontWeight="medium">
                          {amcDetails.contract_number}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          Contract Type
                        </Text>
                        <Badge
                          colorScheme={
                            amcDetails.contract_type === "CMC"
                              ? "purple"
                              : "blue"
                          }
                        >
                          {amcDetails.contract_type}
                        </Badge>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          Vendor
                        </Text>
                        <Text fontWeight="medium">
                          {amcDetails.vendor_name || "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          Start Date
                        </Text>
                        <Text fontWeight="medium">{amcDetails.start_date}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          End Date
                        </Text>
                        <Text fontWeight="medium">{amcDetails.end_date}</Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={textColor}
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          SLA Hours
                        </Text>
                        <Text fontWeight="medium">
                          {amcDetails.sla_hours} Hours
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </CardBody>
            </Collapse>
          </Card>

          {/* Dynamic Custom Fields by Category */}
          {Object.entries(groupFieldsByCategory()).map(
            ([category, fields], index) => {
              const categoryColor = [
                "cyan",
                "pink",
                "yellow",
                "lime",
                "indigo",
              ][index % 5];
              const categoryId = `custom_${category
                .toLowerCase()
                .replace(/\s+/g, "_")}`;

              return (
                <Card
                  key={categoryId}
                  bg={cardBg}
                  border="1px"
                  borderColor={
                    openSections[categoryId]
                      ? `${categoryColor}.200`
                      : borderColor
                  }
                  boxShadow={openSections[categoryId] ? "md" : "sm"}
                  transition="all 0.3s"
                >
                  <CardHeader
                    cursor="pointer"
                    onClick={() => toggleSection(categoryId)}
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                    borderRadius="lg"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon
                          as={FiPackage}
                          color={`${categoryColor}.500`}
                          boxSize={5}
                        />
                        <Box>
                          <Heading size={{base:"sm",md:"md"}} color={headingColor}>
                            {category}
                          </Heading>
                          <Text fontSize={{base:"xs",md:"sm"}} color={textColor}>
                            Custom fields for {category.toLowerCase()}
                          </Text>
                        </Box>
                      </HStack>
                      <Icon
                        as={
                          openSections[categoryId] ? FiChevronUp : FiChevronDown
                        }
                        color={textColor}
                        boxSize={5}
                      />
                    </Flex>
                  </CardHeader>

                  <Collapse in={openSections[categoryId]} animateOpacity>
                    <CardBody pt={0}>
                      <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={6}
                      >
                        {fields.map((field) => renderField(field))}
                      </SimpleGrid>
                    </CardBody>
                  </Collapse>
                </Card>
              );
            }
          )}

          {/* Action Buttons */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                {!viewMode && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={textColor}>
                      All required fields must be completed
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      Draft auto-saved
                    </Badge>
                  </VStack>
                )}

                <HStack spacing={3} ml={viewMode ? "auto" : 0}>
                      <Button size={{base:"sm",md:"md"}} variant="outline" leftIcon={<FiUpload />}>
                        Upload Documents
                      </Button>
                      {!viewMode && (
                      <Button
                        colorScheme="blue"
                        leftIcon={<FiSave />}
                        type="submit"
                        size={{base:"sm",md:"md"}}
                        isLoading={isSubmitting}
                        loadingText={
                          isEditMode ? "Updating Asset..." : "Adding Asset..."
                        }
                      >
                        {isEditMode ? "Update Asset" : "Add Asset"}
                      </Button>
                    
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        </VStack>
      </form>

      {/* </Container> */}
      <AssignContractModal
        asset={selectedAssetForAMC}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => fetchAssetData(assetId)}
      />
    </Box>
  );
};

export default AddAsset;
