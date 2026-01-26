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
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Divider,
  Input,
  Select,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiPackage,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDownload,
  FiTool,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AssignContractModal from "../Components/modals/AssignContractModal";
import ConfirmationModal from "../Components/modals/ConfirmationModal";
import BulkUploadModal from "../Components/modals/BulkUploadModal";

const AssetInventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const headerBg = useColorModeValue("gray.100", "gray.700");

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Confirmation Modal State
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const {
    isOpen: isBulkUploadOpen,
    onOpen: onBulkUploadOpen,
    onClose: onBulkUploadClose,
  } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    colorScheme: "red",
  });

  const triggerConfirm = (config) => {
    setConfirmConfig({
      ...config,
      onConfirm: async () => {
        await config.onConfirm();
        onConfirmClose();
      },
    });
    onConfirmOpen();
  };

  useEffect(() => {
    if (user) {
      fetchAssets(1);
    }
  }, [user, searchTerm, filterCategory]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory) params.append("category", filterCategory);

      const response = await api.get(`/api/assets/?${params.toString()}`);

      if (response.data.results) {
        setAssets(response.data.results);
        setTotalCount(response.data.count);
        setNextPage(response.data.next);
        setPrevPage(response.data.previous);
      } else {
        setAssets(response.data || []);
        setTotalCount(response.data.length || 0);
        setNextPage(null);
        setPrevPage(null);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading assets:", error);
      toast({
        title: "Error loading assets",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAssets = async () => {
    try {
      const response = await api.get("/api/assets/export/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assets_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting assets:", error);
      toast({
        title: "Error exporting assets",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAsset = (assetId) => {
    triggerConfirm({
      title: "Delete Asset",
      message:
        "Are you sure you want to delete this asset? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`/api/assets/${assetId}/`);

          toast({
            title: "Asset deleted",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          fetchAssets();
        } catch (error) {
          toast({
            title: "Error deleting asset",
            description: error.response?.data?.detail || error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      },
    });
  };

  const filteredAssets = assets;

  const categories = [...new Set(assets.map((asset) => asset.category))];

  const handleViewDetails = (asset) => {
    navigate(`/add-asset?id=${asset.id}&view=true`);
  };

  const canManageAssets =
    user?.role === "org_admin" || user?.role === "unit_admin";

  const handleEdit = (assetId) => {
    navigate(`/add-asset?id=${assetId}`);
  };

  return (
    <Box
      mb={{ base: "65`px", md: 0 }}
      bg={bgColor}
      minH="100vh"
      p={{ base: 2, md: 8 }}
      pt={{ base: 4, md: 8 }}
    >
      <Container maxW="8xl">
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={3}>
              <Icon as={FiPackage} boxSize={8} color="blue.500" />
              <Box>
                <Heading size="lg" color={headingColor}>
                  Asset Inventory
                </Heading>
                <Text fontSize="sm" color={textColor}>
                  Manage and track all your assets
                </Text>
              </Box>
            </HStack>
            {canManageAssets && (
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiUpload />}
                  size={"sm"}
                  colorScheme="green"
                  variant={"solid"}
                  onClick={onBulkUploadOpen}
                >
                  Bulk Upload
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  onClick={() => navigate("/add-asset")}
                  size="sm"
                >
                  Add New Asset
                </Button>
              </HStack>
            )}
          </Flex>

          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex gap={4} wrap="wrap">
                  <InputGroup maxW="300px">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search assets..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  </InputGroup>

                  <Button
                    colorScheme="blue"
                    onClick={handleSearch}
                    leftIcon={<FiSearch />}
                  >
                    Search
                  </Button>

                  <Select
                    placeholder="All Categories"
                    maxW="200px"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>

                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    onClick={handleExportAssets}
                  >
                    Export
                  </Button>
                </Flex>

                {loading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="blue.500" />
                  </Flex>
                ) : filteredAssets.length === 0 ? (
                  <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    minH="200px"
                    gap={4}
                  >
                    <Icon as={FiPackage} boxSize={12} color="gray.400" />
                    <Text color={textColor}>No assets found</Text>
                    {canManageAssets && (
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        onClick={() => navigate("/add-asset")}
                      >
                        Add Your First Asset
                      </Button>
                    )}
                  </Flex>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <SimpleGrid
                      columns={1}
                      spacing={4}
                      display={{ base: "grid", md: "none" }}
                    >
                      {filteredAssets.map((asset) => (
                        <Card
                          key={asset.id}
                          border="1px"
                          borderColor={borderColor}
                          variant="outline"
                          bg={cardBg}
                        >
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Flex justify="space-between" align="center">
                                <Badge colorScheme="purple">
                                  {asset.category}
                                </Badge>
                                <Badge
                                  colorScheme={
                                    asset.status === "active" ? "green" : "gray"
                                  }
                                >
                                  {asset.status || "Active"}
                                </Badge>
                              </Flex>

                              <Box>
                                <Text fontWeight="bold" fontSize="md">
                                  {asset.asset_name}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                  {asset.asset_id}
                                </Text>
                              </Box>

                              <Flex justify="space-between" align="center">
                                <Text fontSize="xs" fontWeight="bold">
                                  Type:
                                </Text>
                                <Text fontSize="xs">{asset.asset_type}</Text>
                              </Flex>

                              <Divider />

                              <Flex justify="flex-end" gap={2}>
                                {asset.issue_count > 0 && (
                                  <Badge
                                    colorScheme="red"
                                    variant="subtle"
                                    fontSize={{ base: "xs", md: "sm" }}
                                    px={3}
                                    py={1}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="red.200"
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                    _hover={{
                                      transform: "scale(1.05)",
                                      transition: "transform 0.2s",
                                    }}
                                    cursor="pointer"
                                    onClick={() => {
                                      navigate(
                                        `/issue?asset_name=${asset.asset_name}`,
                                      );
                                    }}
                                  >
                                    <Box
                                      w={{ base: 2, md: 3 }}
                                      h={{ base: 2, md: 3 }}
                                      borderRadius="full"
                                      bg="red.500"
                                      animation="pulse 2s infinite"
                                    />
                                    {asset.issue_count} Issue
                                    {asset.issue_count > 1 ? "s" : ""}
                                  </Badge>
                                )}
                                <IconButton
                                  icon={<FiEye />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewDetails(asset)}
                                  aria-label="View Details"
                                />
                                {canManageAssets && (
                                  <>
                                    <IconButton
                                      icon={<FiTool />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedAsset(asset);
                                        setShowAssignModal(true);
                                      }}
                                      aria-label="Assign AMC/CMC"
                                    />
                                    <IconButton
                                      icon={<FiEdit />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => handleEdit(asset.id)}
                                      aria-label="Edit"
                                    />
                                    <IconButton
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        handleDeleteAsset(asset.id)
                                      }
                                      aria-label="Delete"
                                    />
                                  </>
                                )}
                              </Flex>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>

                    {/* Desktop Table View */}
                    <Box
                      overflowX={"hidden"}
                      overflowY="auto"
                      maxH={{ base: "none", md: "calc(100vh - 400px)" }}
                      minH="350px"
                      display={{ base: "none", md: "block" }}
                      border="1px"
                      borderColor={borderColor}
                      borderRadius="md"
                    >
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Asset ID
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Asset Name
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Type
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Category
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Status
                            </Th>
                            <Th
                              position="sticky"
                              top={0}
                              bg={headerBg}
                              zIndex={10}
                              color={headingColor}
                            >
                              Actions
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredAssets.map((asset) => (
                            <Tr key={asset.id}>
                              <Td fontWeight="medium">{asset.asset_id}</Td>
                              <Td>{asset.asset_name}</Td>
                              <Td>{asset.asset_type}</Td>
                              <Td>
                                <Badge colorScheme="purple">
                                  {asset.category}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    asset.status === "active" ? "green" : "gray"
                                  }
                                >
                                  {asset.status || "Active"}
                                </Badge>
                              </Td>
                              <Td>
                                <Box position="relative" display="inline-block">
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<FiMoreVertical />}
                                      variant="ghost"
                                      size="sm"
                                    />
                                    <MenuList>
                                      <MenuItem
                                        icon={<FiEye />}
                                        onClick={() => handleViewDetails(asset)}
                                      >
                                        View Details
                                      </MenuItem>
                                      {canManageAssets && (
                                        <>
                                          <MenuItem
                                            icon={<FiTool />}
                                            onClick={() => {
                                              setSelectedAsset(asset);
                                              setShowAssignModal(true);
                                            }}
                                          >
                                            Assign AMC/CMC
                                          </MenuItem>
                                          <MenuItem
                                            icon={<FiEdit />}
                                            onClick={() => handleEdit(asset.id)}
                                          >
                                            Edit
                                          </MenuItem>
                                          <MenuItem
                                            icon={<FiTrash2 />}
                                            color="red.500"
                                            onClick={() =>
                                              handleDeleteAsset(asset.id)
                                            }
                                          >
                                            Delete
                                          </MenuItem>
                                        </>
                                      )}
                                    </MenuList>
                                  </Menu>
                                  {asset.issue_count > 0 && (
                                    <Badge
                                      colorScheme="red"
                                      ml={6}
                                      cursor="pointer"
                                      _hover={{
                                        transform: "scale(1.05)",
                                        transition: "transform 0.2s",
                                      }}
                                      onClick={() =>
                                        navigate(
                                          `/issue?asset_name=${asset.asset_name}`,
                                        )
                                      }
                                    >
                                      {asset.issue_count} Issues
                                    </Badge>
                                  )}
                                </Box>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Flex
            justify="space-between"
            align="center"
            mt={4}
            flexWrap="wrap"
            gap={4}
          >
            <Text fontSize="sm" color={textColor}>
              Showing {assets.length} of {totalCount} assets (Page {currentPage}
              )
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => fetchAssets(currentPage - 1)}
                isDisabled={!prevPage || loading}
                leftIcon={<Icon as={FiChevronLeft} />}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => fetchAssets(currentPage + 1)}
                isDisabled={!nextPage || loading}
                rightIcon={<Icon as={FiChevronRight} />}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Container>

      <AssignContractModal
        asset={selectedAsset}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => fetchAssets()}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        colorScheme={confirmConfig.colorScheme}
      />

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={onBulkUploadClose}
        onUploadSuccess={fetchAssets}
      />
    </Box>
  );
};

export default AssetInventory;
