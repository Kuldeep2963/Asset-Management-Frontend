import React, { useState, useEffect, useCallback } from "react";
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
  Textarea,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Tooltip,
  IconButton,
  Switch,
  Tag,
  useToast,
  Spinner,
  Spacer,
  Center,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Avatar,
  Progress,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  AvatarGroup,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Collapse,
  useBreakpointValue,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiDollarSign,
  FiTool,
  FiBell,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiChevronDown,
  FiMoreVertical,
  FiSettings,
  FiArchive,
  FiGlobe,
  FiTrendingUp,
  FiTrendingDown,
  FiExternalLink,
  FiCopy,
  FiShare2,
  FiStar,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiGrid,
  FiList,
  FiPrinter,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
  FiBriefcase,
} from "react-icons/fi";
import {
  MdOutlineAssignment,
  MdOutlineDateRange,
  MdOutlineVerified,
  MdOutlineWarning,
  MdOutlineTimer,
  MdOutlineAttachMoney,
} from "react-icons/md";
import { FaRegFilePdf, FaRegFileExcel } from "react-icons/fa";
import { AiOutlineQrcode, AiOutlineDashboard } from "react-icons/ai";
import { BsGraphUp, BsGraphDown } from "react-icons/bs";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import api from "../services/api";
import ConfirmationModal from "../Components/modals/ConfirmationModal";
import {
  format,
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { debounce } from "lodash";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const AMC = () => {
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isVendorCreateOpen,
    onOpen: onVendorCreateOpen,
    onClose: onVendorCreateClose,
  } = useDisclosure();
  const {
    isOpen: isVendorDrawerOpen,
    onOpen: onVendorDrawerOpen,
    onClose: onVendorDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isAssetAMCModalOpen,
    onOpen: onAssetAMCModalOpen,
    onClose: onAssetAMCModalClose,
  } = useDisclosure();
  const {
    isOpen: isBulkUploadOpen,
    onOpen: onBulkUploadOpen,
    onClose: onBulkUploadClose,
  } = useDisclosure();

  // Confirmation Modal State
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
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

  const handleExportData = async () => {
    try {
      const endpoint = mainTab === 0 ? "/api/contracts/export/" : "/api/vendors/export/";
      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = mainTab === 0 ? "contracts" : "vendors";
      link.setAttribute("download", `${filename}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Export Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error exporting contracts:", error);
      toast({
        title: "Export Failed",
        description: error.response?.data?.detail || "Failed to export contracts",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadSampleFile = async (type) => {
    try {
      const endpoint = type === 'contract' ? "/api/contracts/sample-file/" : "/api/vendors/sample-file/";
      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_sample_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download sample file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const [activeTab, setActiveTab] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [units, setUnits] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVendorsLoading, setIsVendorsLoading] = useState(false);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table, grid, kanban
  const [filterVendor, setFilterVendor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("end_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const userData = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user'));
  const [bulkUnits, setBulkUnits] = useState(userData?.unit?.id ? [userData.unit.id.toString()] : []);
  const [bulkUploadTab, setBulkUploadTab] = useState(0); // 0 for Contracts, 1 for Vendors
  const [formData, setFormData] = useState({
    contract_type: "AMC",
    vendor: "",
    unit: userData?.unit?.id || "",
    contract_number: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(addDays(new Date(), 365), "yyyy-MM-dd"),
    sla_hours: 24,
    coverage_details: "",
    is_active: true,
  });

  const [vendorFormData, setVendorFormData] = useState({
    organization : userData.organization.id,
    name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    totalContracts: 0,
    totalVendors: 0,
    renewalRate: 0,
    avgResponseTime: 0,
  });

  const [chartData, setChartData] = useState({
    monthlyContracts: {},
    vendorDistribution: {},
    contractTypes: {},
    slaCompliance: {},
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const promises = [fetchContracts(), fetchVendors()];
      if (userData?.role === "org_admin") {
        promises.push(fetchUnits());
      }
      const [contractsData, vendorsData] = await Promise.all(promises);

      if (contractsData && vendorsData) {
        calculateStats(contractsData, vendorsData);
      }
    } catch (error) {
      console.error("Error fetching all data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await api.get("/api/contracts/");
      const data = response.data.results || response.data || [];
      setContracts(data);
      return data;
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch contracts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    }
  };

  const fetchVendors = async () => {
    try {
      setIsVendorsLoading(true);
      const response = await api.get("/api/vendors/");
      const data = response.data.results || response.data || [];
      setVendors(data);
      return data;
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch vendors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    } finally {
      setIsVendorsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      setIsUnitsLoading(true);
      const response = await api.get("/api/units/");
      const data = response.data.results || response.data || [];
      setUnits(data);
      return data;
    } catch (error) {
      console.error("Error fetching units:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch units",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return [];
    } finally {
      setIsUnitsLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setIsAssetsLoading(true);
      const response = await api.get("/api/assets/");
      const data = response.data.results || response.data || [];
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch assets",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAssetsLoading(false);
    }
  };

  const fetchContractAssets = async (contractId) => {
    try {
      const response = await api.get(
        `/api/contracts/${contractId}/assets/`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching contract assets:", error);
      return [];
    }
  };

  const fetchAssetAMCInfo = async (assetId) => {
    try {
      const response = await api.get(
        `/api/assets/${assetId}/amc_cmc/`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching asset AMC info:", error);
      return null;
    }
  };

  const calculateStats = (contractsData, vendorsData) => {
    try {
      const now = new Date();
      const thirtyDaysFromNow = addDays(now, 30);

      const active = contractsData.filter(
        (c) => c.is_active && isBefore(now, parseISO(c.end_date)),
      ).length;
      const expiring = contractsData.filter((c) => {
        const endDate = parseISO(c.end_date);
        return (
          c.is_active &&
          isAfter(endDate, now) &&
          isBefore(endDate, thirtyDaysFromNow)
        );
      }).length;
      const expired = contractsData.filter((c) =>
        isAfter(now, parseISO(c.end_date)),
      ).length;

      const totalVendors = vendorsData.length;
      const avgResponseTime =
        contractsData.length > 0
          ? contractsData.reduce((sum, c) => sum + c.sla_hours, 0) /
            contractsData.length
          : 0;

      setStats({
        total: contractsData.length,
        active,
        expiring,
        expired,
        totalContracts: contractsData.length,
        totalVendors,
        renewalRate:
          active > 0 ? Math.round((active / contractsData.length) * 100) : 0,
        avgResponseTime: Math.round(avgResponseTime),
      });

      // Generate chart data
      generateChartData(contractsData);
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const generateChartData = (contractsData) => {
    // Monthly contracts data
    const monthlyData = {};
    contractsData.forEach((contract) => {
      const month = format(parseISO(contract.start_date), "MMM yyyy");
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Vendor distribution
    const vendorData = {};
    contractsData.forEach((contract) => {
      const vendorName = contract.vendor_name || "Unknown";
      vendorData[vendorName] = (vendorData[vendorName] || 0) + 1;
    });

    // Contract types
    const typeData = {};
    contractsData.forEach((contract) => {
      typeData[contract.contract_type] =
        (typeData[contract.contract_type] || 0) + 1;
    });

    setChartData({
      monthlyContracts: monthlyData,
      vendorDistribution: vendorData,
      contractTypes: typeData,
      slaCompliance: {
        compliant: contractsData.filter((c) => c.sla_hours <= 24).length,
        nonCompliant: contractsData.filter((c) => c.sla_hours > 24).length,
      },
    });
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    [],
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVendorInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateContract = async () => {
    try {
      await api.post(`/api/contracts/`, formData);
      toast({
        title: "Success",
        description: "Maintenance contract has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      await fetchAllData();
      resetForm();
      onCreateClose();
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to create contract",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleCreateVendor = async () => {
    try {
      await api.post(`/api/vendors/`, vendorFormData);
      toast({
        title: "Success",
        description: "Vendor has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      await fetchVendors();
      resetVendorForm();
      onVendorCreateClose();
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create vendor",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setFormData({
      contract_type: contract.contract_type,
      vendor: contract.vendor,
      unit: contract.unit,
      contract_number: contract.contract_number,
      start_date: contract.start_date,
      end_date: contract.end_date,
      sla_hours: contract.sla_hours,
      coverage_details: contract.coverage_details,
      is_active: contract.is_active,
    });
    onCreateOpen();
  };

  const handleUpdateContract = async () => {
    try {
      await api.put(
        `/api/contracts/${selectedContract.id}/`,
        formData,
      );
      toast({
        title: "Success",
        description: "Maintenance contract has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      await fetchAllData();
      resetForm();
      onCreateClose();
    } catch (error) {
      console.error("Error updating contract:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to update contract",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleDeleteContract = (contractId) => {
    triggerConfirm({
      title: "Delete Contract",
      message: "Are you sure you want to delete this contract? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`/api/contracts/${contractId}/`);
          toast({
            title: "Deleted",
            description: "Contract has been deleted successfully",
            status: "info",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          await fetchAllData();
        } catch (error) {
          console.error("Error deleting contract:", error);
          toast({
            title: "Error",
            description:
              error.response?.data?.detail || "Failed to delete contract",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      },
    });
  };

  const handleViewDetails = async (contract) => {
    setSelectedContract(contract);
    const contractAssets = await fetchContractAssets(contract.id);
    setSelectedAssets(contractAssets);
    onDetailOpen();
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    onVendorDrawerOpen();
  };

  const handleCheckAssetAMC = async (assetId) => {
    setSelectedAsset(assetId);
    const amcInfo = await fetchAssetAMCInfo(assetId);
    setSelectedContract(amcInfo);
    onAssetAMCModalOpen();
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);
    if (bulkUnits.length > 0) {
      bulkUnits.forEach(id => formData.append("unit_ids", id));
    }

    const endpoint = bulkUploadTab === 0 
      ? "/api/contracts/bulk-upload/" 
      : "/api/vendors/bulk-upload/";

    setIsBulkUploading(true);
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Success",
        description: response.data?.message || `${bulkUploadTab === 0 ? "Contracts" : "Vendors"} uploaded successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchAllData();
      onBulkUploadClose();
      setBulkFile(null);
      setBulkUnits(userData?.unit?.id ? [userData.unit.id.toString()] : []);
    } catch (error) {
      console.error(`Error uploading bulk ${bulkUploadTab === 0 ? "contracts" : "vendors"}:`, error);
      
      let errorMessage = `Failed to upload ${bulkUploadTab === 0 ? "contracts" : "vendors"}`;
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      toast({
        title: "Upload Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    const statuses = ["all", "active", "expiring", "expired"];
    if (index < 4) {
      setFilterStatus(statuses[index]);
    }
  };

  const handleMainTabChange = (index) => {
    setMainTab(index);
    if (index === 1) {
      setFilterStatus("vendors");
    } else {
      const statuses = ["all", "active", "expiring", "expired"];
      setFilterStatus(statuses[activeTab]);
    }
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    const statuses = ["all", "active", "expiring", "expired", "vendors"];
    const index = statuses.indexOf(status);
    if (index !== -1) {
      if (index < 4) {
        setMainTab(0);
        setActiveTab(index);
      } else {
        setMainTab(1);
      }
    }
  };

  const renderContractList = () => {
    if (isLoading) {
      return (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color={textColor}>Loading contracts...</Text>
          </VStack>
        </Center>
      );
    }

    if (filteredContracts.length === 0) {
      return (
        <Center py={20}>
          <VStack spacing={4}>
            <Icon as={FiFileText} boxSize={16} color="gray.400" />
            <Text color={textColor} fontSize="lg">
              No contracts found
            </Text>
            <Text color={textColor} fontSize="sm">
              {searchQuery
                ? "Try a different search term"
                : "Start by creating your first contract"}
            </Text>
            <Button
              colorScheme="blue"
              onClick={onCreateOpen}
              leftIcon={<FiPlus />}
            >
              Create Contract
            </Button>
          </VStack>
        </Center>
      );
    }

    return (
      <>
        <Box
          display={{
            base: "none",
            md: viewMode === "table" ? "block" : "none",
          }}
        >
          <ContractTable />
        </Box>
        <Box
          display={{
            base: "block",
            md: viewMode === "grid" ? "block" : "none",
          }}
        >
          <ContractGrid />
        </Box>
      </>
    );
  };

  const resetForm = () => {
    setFormData({
      contract_type: "AMC",
      vendor: "",
      unit: userData?.unit?.id || "",
      contract_number: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(addDays(new Date(), 365), "yyyy-MM-dd"),
      sla_hours: 24,
      coverage_details: "",
      is_active: true,
    });
    setSelectedContract(null);
  };

  const resetVendorForm = () => {
    setVendorFormData({
      
      name: "",
      email: "",
      phone: "",
      address: "",
      is_active: true,
    });
  };

  const getStatusBadge = (contract) => {
    const now = new Date();
    const endDate = parseISO(contract.end_date);
    const thirtyDaysFromNow = addDays(now, 30);

    if (isAfter(now, endDate)) {
      return (
        <Badge colorScheme="red" display="flex" alignItems="center" gap={1}>
          <FiXCircle /> Expired
        </Badge>
      );
    } else if (isBefore(endDate, thirtyDaysFromNow) && isAfter(endDate, now)) {
      return (
        <Badge colorScheme="orange" display="flex" alignItems="center" gap={1}>
          <FiAlertTriangle /> Expiring Soon
        </Badge>
      );
    } else if (contract.is_active) {
      return (
        <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
          <FiCheckCircle /> Active
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="gray" display="flex" alignItems="center" gap={1}>
          <FiClock /> Inactive
        </Badge>
      );
    }
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = parseISO(endDate);
    return differenceInDays(end, now);
  };

  const getContractProgress = (contract) => {
    const start = parseISO(contract.start_date);
    const end = parseISO(contract.end_date);
    const now = new Date();
    const totalDuration = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const filteredContracts = contracts
    .filter((contract) => {
      const matchesSearch =
        contract.vendor_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        contract.contract_number
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        contract.coverage_details
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesVendor =
        filterVendor === "all" ||
        String(contract.vendor) === String(filterVendor);

      const now = new Date();
      const endDate = parseISO(contract.end_date);
      const thirtyDaysFromNow = addDays(now, 30);

      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = contract.is_active && isBefore(now, endDate);
      } else if (filterStatus === "expiring") {
        matchesStatus =
          contract.is_active &&
          isAfter(endDate, now) &&
          isBefore(endDate, thirtyDaysFromNow);
      } else if (filterStatus === "expired") {
        matchesStatus = isAfter(now, endDate);
      }

      return matchesSearch && matchesVendor && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "end_date") {
        aValue = parseISO(a.end_date);
        bValue = parseISO(b.end_date);
      } else if (sortBy === "sla_hours") {
        aValue = a.sla_hours;
        bValue = b.sla_hours;
      } else if (sortBy === "vendor_name") {
        aValue = a.vendor_name || "";
        bValue = b.vendor_name || "";
      } else {
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const generateContractNumber = () => {
    const prefix = formData.contract_type === "AMC" ? "AMC" : "CMC";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${year}-${random}`;
  };

  const QuickActions = () => (
    <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
      <CardBody>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Wrap spacing={{ base: 5, md: 5 }}>
            <Button
              size={"sm"}
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onCreateOpen}
            >
              New Contract
            </Button>
            <Button
              size={"sm"}
              leftIcon={<FiUserPlus />}
              colorScheme="teal"
              onClick={onVendorCreateOpen}
            >
              Add Vendor
            </Button>
            <Button
              size={"sm"}
              leftIcon={<FiUploadCloud />}
              colorScheme="purple"
              onClick={onBulkUploadOpen}
            >
              Bulk Upload
            </Button>
          </Wrap>
          <Wrap spacing={{ base: 5, md: 5 }}>
            <Button size={"sm"} colorScheme="green" leftIcon={<FiPrinter />} variant="outline" onClick={handlePrint}>
              Print Report
            </Button>
          </Wrap>
        </Flex>
      </CardBody>
    </Card>
  );

  const StatsOverview = () => (
    <SimpleGrid columns={{ base: 2, md: 4, lg: 8 }} spacing={4} mb={8}>
      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiFileText} color="blue.500" /> Total Contracts
            </StatLabel>
            <StatNumber color="blue.500">{stats.total}</StatNumber>
            <StatHelpText>
              <Text
                as="span"
                color={stats.total > 0 ? "green.500" : "gray.500"}
              >
                <Icon
                  as={stats.total > 0 ? FiTrendingUp : FiTrendingDown}
                  mr={1}
                />
                {stats.total} active
              </Text>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiCheckCircle} color="green.500" /> Active
            </StatLabel>
            <StatNumber color="green.500">{stats.active}</StatNumber>
            <StatHelpText>
              <Text as="span" color="green.500">
                {stats.renewalRate}% renewal rate
              </Text>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiAlertTriangle} color="orange.500" /> Expiring Soon
            </StatLabel>
            <StatNumber color="orange.500">{stats.expiring}</StatNumber>
            <StatHelpText>Within 30 days</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiXCircle} color="red.500" /> Expired
            </StatLabel>
            <StatNumber color="red.500">{stats.expired}</StatNumber>
            <StatHelpText>Needs attention</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiUsers} color="purple.500" /> Vendors
            </StatLabel>
            <StatNumber color="purple.500">{stats.totalVendors}</StatNumber>
            <StatHelpText>Active partners</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={MdOutlineTimer} color="teal.500" /> Avg SLA
            </StatLabel>
            <StatNumber color="teal.500">{stats.avgResponseTime}h</StatNumber>
            <StatHelpText>Response time</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiActivity} color="cyan.500" /> SLA Compliance
            </StatLabel>
            <StatNumber color="cyan.500">
              {chartData.slaCompliance.compliant > 0
                ? Math.round(
                    (chartData.slaCompliance.compliant / stats.total) * 100,
                  )
                : 0}
              %
            </StatNumber>
            <StatHelpText>≤ 24 hours</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
      >
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiBarChart2} color="pink.500" /> Coverage
            </StatLabel>
            <StatNumber color="pink.500">
              {stats.active > 0
                ? Math.round((stats.active / stats.total) * 100)
                : 0}
              %
            </StatNumber>
            <StatHelpText>Active coverage</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );

  const ChartsSection = () => (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Contracts Overview</Heading>
          <Text fontSize="sm" color={textColor}>
            Monthly distribution
          </Text>
        </CardHeader>
        <CardBody>
          <Box h="300px">
            <Bar
              data={{
                labels: Object.keys(chartData.monthlyContracts),
                datasets: [
                  {
                    label: "Contracts Created",
                    data: Object.values(chartData.monthlyContracts),
                    backgroundColor: "rgba(54, 162, 235, 0.8)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </Box>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Contract Types</Heading>
          <Text fontSize="sm" color={textColor}>
            AMC vs CMC distribution
          </Text>
        </CardHeader>
        <CardBody>
          <Box h="300px">
            <Pie
              data={{
                labels: Object.keys(chartData.contractTypes),
                datasets: [
                  {
                    data: Object.values(chartData.contractTypes),
                    backgroundColor: [
                      "rgba(255, 99, 132, 0.8)",
                      "rgba(75, 192, 192, 0.8)",
                    ],
                    borderColor: [
                      "rgba(255, 99, 132, 1)",
                      "rgba(75, 192, 192, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </Box>
        </CardBody>
      </Card>
    </SimpleGrid>
  );

  const ContractTable = () => (
    <TableContainer>
      <Table variant="simple">
        <Thead bg={useColorModeValue("gray.50", "gray.900")}>
          <Tr>
            <Th>
              <Flex align="center" gap={2}>
                Contract
                <Icon
                  as={FiChevronDown}
                  cursor="pointer"
                  onClick={() => {
                    setSortBy("contract_number");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                />
              </Flex>
            </Th>
            <Th>Type</Th>
            <Th>Vendor</Th>
            <Th>Duration</Th>
            <Th>SLA</Th>
            <Th>Progress</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredContracts.map((contract) => {
            const daysLeft = getDaysRemaining(contract.end_date);
            const progress = getContractProgress(contract);

            return (
              <Tr
                key={contract.id}
                _hover={{ bg: useColorModeValue("gray.50", "gray.900") }}
                cursor="pointer"
                onClick={() => handleViewDetails(contract)}
              >
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{contract.contract_number}</Text>
                    <Text fontSize="sm" color={textColor}>
                      {format(parseISO(contract.start_date), "MMM dd, yyyy")} -{" "}
                      {format(parseISO(contract.end_date), "MMM dd, yyyy")}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Tag
                    colorScheme={
                      contract.contract_type === "CMC" ? "purple" : "blue"
                    }
                    size="lg"
                    borderRadius="full"
                  >
                    {contract.contract_type}
                  </Tag>
                </Td>
                <Td>
                  <HStack>
                    <Avatar size="sm" name={contract.vendor_name} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{contract.vendor_name}</Text>
                      <Text fontSize="xs" color={textColor}>
                        {
                          contracts.filter((c) => c.vendor === contract.vendor)
                            .length
                        }{" "}
                        contracts
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text>
                      {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </Text>
                    <Progress
                      value={progress}
                      size="sm"
                      colorScheme={
                        progress > 80
                          ? "red"
                          : progress > 60
                            ? "orange"
                            : "green"
                      }
                      width="100px"
                      borderRadius="full"
                    />
                  </VStack>
                </Td>
                <Td>
                  <HStack>
                    <Icon as={MdOutlineTimer} />
                    <Text>{contract.sla_hours}h</Text>
                    {contract.sla_hours <= 24 && (
                      <Badge colorScheme="green" size="sm">
                        Fast
                      </Badge>
                    )}
                  </HStack>
                </Td>
                <Td>
                  <Tooltip label={`${Math.round(progress)}% completed`}>
                    <Progress
                      value={progress}
                      size="sm"
                      colorScheme={
                        progress > 80
                          ? "red"
                          : progress > 60
                            ? "orange"
                            : "green"
                      }
                      width="80px"
                      borderRadius="full"
                    />
                  </Tooltip>
                </Td>
                <Td>{getStatusBadge(contract)}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
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
                        onClick={() => handleViewDetails(contract)}
                      >
                        View Details
                      </MenuItem>
                      <MenuItem
                        icon={<FiEdit />}
                        onClick={() => handleEditContract(contract)}
                      >
                        Edit Contract
                      </MenuItem>
                      <MenuItem
                        icon={<FiCopy />}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            contract.contract_number,
                          );
                          toast({
                            title: "Copied",
                            description: "Contract number copied to clipboard",
                            status: "success",
                            duration: 2000,
                          });
                        }}
                      >
                        Copy Contract No.
                      </MenuItem>
                      <MenuItem
                        icon={<FiExternalLink />}
                        onClick={() => {
                          // Open contract in new tab
                          window.open(`/contracts/${contract.id}`, "_blank");
                        }}
                      >
                        Open in New Tab
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        icon={<FiTrash2 />}
                        color="red.500"
                        onClick={() => handleDeleteContract(contract.id)}
                      >
                        Delete Contract
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );

  const ContractGrid = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {filteredContracts.map((contract) => {
        const daysLeft = getDaysRemaining(contract.end_date);
        const progress = getContractProgress(contract);

        return (
          <Card
            key={contract.id}
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            _hover={{
              transform: "translateY(-4px)",
              shadow: "lg",
              transition: "all 0.2s",
            }}
            cursor="pointer"
            onClick={() => handleViewDetails(contract)}
          >
            <CardHeader pb={2}>
              <Flex justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Tag
                    colorScheme={
                      contract.contract_type === "CMC" ? "purple" : "blue"
                    }
                    size="sm"
                    borderRadius="full"
                  >
                    {contract.contract_type}
                  </Tag>
                  <Heading size="md">{contract.contract_number}</Heading>
                  <Text fontSize="sm" color={textColor}>
                    {contract.vendor_name}
                  </Text>
                </VStack>
                {getStatusBadge(contract)}
              </Flex>
            </CardHeader>
            <CardBody pt={2}>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between">
                  <Text fontSize="sm" color={textColor}>
                    Duration
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {format(parseISO(contract.start_date), "MMM dd")} -{" "}
                    {format(parseISO(contract.end_date), "MMM dd, yyyy")}
                  </Text>
                </Flex>

                <Box>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm" color={textColor}>
                      Progress
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {Math.round(progress)}%
                    </Text>
                  </Flex>
                  <Progress
                    value={progress}
                    size="sm"
                    colorScheme={
                      progress > 80 ? "red" : progress > 60 ? "orange" : "green"
                    }
                    borderRadius="full"
                  />
                </Box>

                <SimpleGrid columns={2} spacing={3}>
                  <Box>
                    <Text fontSize="sm" color={textColor}>
                      SLA
                    </Text>
                    <Text fontWeight="medium">{contract.sla_hours}h</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={textColor}>
                      Days Left
                    </Text>
                    <Text
                      fontWeight="bold"
                      color={
                        daysLeft < 30
                          ? "orange.500"
                          : daysLeft < 0
                            ? "red.500"
                            : "green.500"
                      }
                    >
                      {daysLeft > 0 ? daysLeft : "Expired"}
                    </Text>
                  </Box>
                </SimpleGrid>

                {contract.coverage_details && (
                  <Text fontSize="sm" noOfLines={2} color={textColor}>
                    {contract.coverage_details}
                  </Text>
                )}

                <Divider />

                <Flex
                  justify="space-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm" variant="ghost" onClick={() => handleViewDetails(contract)} leftIcon={<FiEye />}>
                    View
                  </Button>
                  <HStack>
                    <IconButton
                      icon={<FiEdit />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditContract(contract);
                      }}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteContract(contract.id);
                      }}
                    />
                  </HStack>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );

  return (
    <Box
      p={{ base: 2, md: 8 }}
      pt={{ base: 4, md: 6 }}
      bg={bgColor}
      minH="100vh"
      mb={{ base: 8, md: 0 }}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        pl={2}
        align="center"
        mb={6}
        gap={4}
        flexDirection={{ base: "column", md: "row" }}
      >
        <VStack align="start" spacing={2}>
          <Heading as="h1" size="lg" color={headingColor}>
            Maintenance Contracts
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color={textColor}>
            Manage Annual and Comprehensive Maintenance Contracts with advanced
            analytics
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            size={"sm"}
            leftIcon={<FiRefreshCw />}
            variant="outline"
            onClick={fetchAllData}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Menu>
            <MenuButton
              size={"sm"}
              as={Button}
              rightIcon={<FiChevronDown />}
              colorScheme="blue"
            >
              <HStack>
                <FiDownload />
                <Text>Export</Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaRegFileExcel />} onClick={handleExportData}>Export Vendors</MenuItem>
              <MenuItem icon={<FaRegFilePdf />} onClick={handleExportData}>Export Contracts</MenuItem>

            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview */}
      <StatsOverview />

      {/* Charts Section */}
      <ChartsSection />

      {/* Alerts */}
      {stats.expiring > 0 && (
        <Alert status="warning" mb={6} borderRadius="lg" variant="left-accent">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Contracts Expiring Soon!</AlertTitle>
            <AlertDescription>
              {stats.expiring} contract(s) will expire within the next 30 days.
              <Button ml={2} size="sm" colorScheme="orange" variant="link">
                Review Now
              </Button>
            </AlertDescription>
          </Box>
          <IconButton
            icon={<FiXCircle />}
            variant="ghost"
            size="sm"
            aria-label="Close"
          />
        </Alert>
      )}

      {/* Main Content Card */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} shadow="lg">
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md">Maintenance Contracts</Heading>

            <HStack spacing={4}>
              {/* View Mode Toggle */}
              <HStack display={{ base: "none", md: "flex" }}>
                <IconButton
                  size={"sm"}
                  icon={<FiList />}
                  variant={viewMode === "table" ? "solid" : "outline"}
                  colorScheme={viewMode === "table" ? "blue" : "gray"}
                  onClick={() => setViewMode("table")}
                  aria-label="Table view"
                />
                <IconButton
                  size={"sm"}
                  icon={<FiGrid />}
                  variant={viewMode === "grid" ? "solid" : "outline"}
                  colorScheme={viewMode === "grid" ? "blue" : "gray"}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                />
              </HStack>

              {/* Search */}
              <InputGroup maxW="300px" size={"sm"}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
                {searchQuery && (
                  <InputRightElement>
                    <IconButton
                      size="xs"
                      icon={<FiXCircle />}
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Filters */}
              <HStack spacing={3}>
                <Select
                  size={"sm"}
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  width={{ base: "100px", md: "150px" }}
                >
                  <option value="all">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </Select>

                <Select
                  size={"sm"}
                  value={filterStatus}
                  onChange={handleStatusChange}
                  width={{ base: "100px", md: "150px" }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </Select>
              </HStack>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody>
          <Tabs index={mainTab} onChange={handleMainTabChange} variant="enclosed" colorScheme="blue">
            <TabList mb={4}>
              <Tab fontWeight="bold">Contracts</Tab>
              <Tab fontWeight="bold">Vendors</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Tabs
                  index={activeTab}
                  colorScheme="blue"
                  onChange={handleTabChange}
                  mb={4}
                >
                  <TabList gap={{ base: 0, md: 8 }} overflowX="auto" pb={2}>
                    <Tab>
                      <Icon as={FiFileText} mr={2} />
                      <Text>All</Text>
                      <Badge borderRadius="full" ml={2} colorScheme="blue">
                        {contracts.length}
                      </Badge>
                    </Tab>
                    <Tab>
                      <Icon as={FiCheckCircle} mr={2} />
                      <Text display={{ base: "none", md: "block" }}>Active</Text>
                      <Badge borderRadius="full" ml={2} colorScheme="green">
                        {stats.active}
                      </Badge>
                    </Tab>
                    <Tab>
                      <Icon as={FiAlertTriangle} mr={2} />
                      <Text display={{ base: "none", md: "block" }}>
                        Expiring Soon
                      </Text>
                      <Badge borderRadius="full" ml={2} colorScheme="orange">
                        {stats.expiring}
                      </Badge>
                    </Tab>
                    <Tab>
                      <Icon as={FiXCircle} mr={2} />
                      <Text display={{ base: "none", md: "block" }}>Expired</Text>
                      <Badge borderRadius="full" ml={2} colorScheme="red">
                        {stats.expired}
                      </Badge>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0} pt={4}>
                      {renderContractList()}
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                      {renderContractList()}
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                      {renderContractList()}
                    </TabPanel>

                    <TabPanel p={0} pt={4}>
                      {renderContractList()}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </TabPanel>

              <TabPanel p={0}>
                <Box pt={4}>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {vendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        bg={cardBg}
                        border="1px"
                        borderColor={borderColor}
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Avatar name={vendor.name} size="md" />
                              <Badge
                                colorScheme={vendor.is_active ? "green" : "gray"}
                              >
                                {vendor.is_active ? "Active" : "Inactive"}
                              </Badge>
                              
                            </HStack>

                            <VStack align="stretch" spacing={1}>
                              <Heading size="md">{vendor.name}</Heading>
                              <HStack>
                              <Text color={textColor} fontSize="sm">
                                {
                                  contracts.filter((c) => c.vendor === vendor.id)
                                    .length
                                }{" "}
                                contracts
                              </Text>
                              <Spacer/>
                              <Tag color={"green"} size="md" mb={2}>
                                ID: {vendor.id}
                              </Tag>
                              </HStack>
                            </VStack>

                            <Divider />

                            <VStack align="stretch" spacing={2}>
                              {vendor.email && (
                                <HStack>
                                  <Icon as={FiMail} color={textColor} />
                                  <Text fontSize="sm">{vendor.email}</Text>
                                </HStack>
                              )}
                              {vendor.phone && (
                                <HStack>
                                  <Icon as={FiPhone} color={textColor} />
                                  <Text fontSize="sm">{vendor.phone}</Text>
                                </HStack>
                              )}
                              {vendor.address && (
                                <HStack align="start">
                                  <Icon as={FiMapPin} color={textColor} mt={1} />
                                  <Text fontSize="sm" noOfLines={2}>
                                    {vendor.address}
                                  </Text>
                                </HStack>
                              )}
                            </VStack>

                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<FiEye />}
                              onClick={() => handleViewVendor(vendor)}
                            >
                              View Details
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Create Contract Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          onCreateClose();
          resetForm();
        }}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">
              {selectedContract ? "Edit Maintenance Contract" : "Create New Maintenance Contract"}
            </Heading>
            <Text fontSize="sm" color={textColor} mt={1}>
              {selectedContract ? "Update the contract details below" : "Fill in the contract details below"}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              <FormControl isRequired>
                <FormLabel>Contract Type</FormLabel>
                <Select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleInputChange}
                >
                  <option value="AMC">AMC (Annual Maintenance Contract)</option>
                  <option value="CMC">
                    CMC (Comprehensive Maintenance Contract)
                  </option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Contract Number</FormLabel>
                <InputGroup>
                  <Input
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleInputChange}
                    placeholder="e.g., AMC-2025-001"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          contract_number: generateContractNumber(),
                        }));
                      }}
                    >
                      Generate
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Vendor</FormLabel>
                <Select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  variant="link"
                  mt={2}
                  leftIcon={<FiUserPlus />}
                  onClick={() => {
                    onCreateClose();
                    onVendorCreateOpen();
                  }}
                >
                  Add New Vendor
                </Button>
              </FormControl>

              {userData?.role === "org_admin" && (
                <FormControl isRequired>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="Select Unit"
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>SLA Response Time (Hours)</FormLabel>
                <NumberInput
                  value={formData.sla_hours}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, sla_hours: value }))
                  }
                  min={1}
                  max={168}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Maximum response time for service requests
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl
                display="flex"
                alignItems="center"
                gridColumn={{ base: "span 1", md: "span 2" }}
              >
                <Switch
                  name="is_active"
                  isChecked={formData.is_active}
                  onChange={handleInputChange}
                  colorScheme="green"
                  size="lg"
                />
                <FormLabel mb="0" ml={3}>
                  Active Contract
                </FormLabel>
              </FormControl>

              <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                <FormLabel>Coverage Details</FormLabel>
                <Textarea
                  name="coverage_details"
                  value={formData.coverage_details}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what is covered under this contract, including:
• Parts coverage
• Labor charges
• Response time commitments
• Exclusions and limitations
• Special terms and conditions"
                />
              </FormControl>

              <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Any additional information or special instructions..."
                  rows={2}
                />
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={() => {
              onCreateClose();
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={selectedContract ? handleUpdateContract : handleCreateContract}
              size={{base:"md",md:"md"}}
              leftIcon={selectedContract ? <FiEdit /> : <FiPlus />}
            >
              {selectedContract ? "Update Contract" : "Create Contract"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Vendor Modal */}
      <Modal
        isOpen={isVendorCreateOpen}
        onClose={onVendorCreateClose}
        size="2xl"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Add New Vendor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isRequired gridColumn="span 2">
                <FormLabel>Vendor Name</FormLabel>
                <Input
                  name="name"
                  value={vendorFormData.name}
                  onChange={handleVendorInputChange}
                  placeholder="Enter vendor company name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={vendorFormData.email}
                  onChange={handleVendorInputChange}
                  placeholder="vendor@example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone"
                  value={vendorFormData.phone}
                  onChange={handleVendorInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </FormControl>

              <FormControl gridColumn="span 2">
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={vendorFormData.address}
                  onChange={handleVendorInputChange}
                  placeholder="Full company address"
                  rows={3}
                />
              </FormControl>

              <FormControl
                display="flex"
                alignItems="center"
                gridColumn="span 2"
              >
                <Switch
                  name="is_active"
                  isChecked={vendorFormData.is_active}
                  onChange={handleVendorInputChange}
                  colorScheme="green"
                />
                <FormLabel mb="0" ml={3}>
                  Active Vendor
                </FormLabel>
              </FormControl>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVendorCreateClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleCreateVendor}>
              <FiUserPlus /> Add Vendor
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={isBulkUploadOpen} onClose={() => {
  onBulkUploadClose();
  setBulkFile(null);
  setBulkUnits(userData?.unit?.id ? [userData.unit.id.toString()] : []);
  setBulkUploadTab(0);
}} size={{base:"sm",md:"lg"}} scrollBehavior="inside">
  <ModalOverlay backdropFilter="blur(4px)" />
  <ModalContent>
    <ModalHeader>Bulk Upload Data</ModalHeader>
    <ModalCloseButton isDisabled={isBulkUploading} />
    <ModalBody>
      
      <Tabs isFitted colorScheme="blue" index={bulkUploadTab} onChange={(index) => {
        if (isBulkUploading) return;
        setBulkUploadTab(index);
        setBulkFile(null);
      }}>
        <TabList mb="1em">
          <Tab>Contracts</Tab>
          <Tab>Vendors</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <VStack spacing={4} align="stretch" key={`bulk-contracts-${bulkUploadTab}`}>
               {userData?.role === "org_admin" && (
        <FormControl isRequired mb={4}>
          <FormLabel fontWeight="bold">Select Units</FormLabel>
          <Box 
            borderWidth="1px" 
            borderRadius="md" 
            p={3} 
            maxH="200px" 
            overflowY="auto"
            bg={useColorModeValue("white", "gray.700")}
          >
            <VStack align="start" spacing={2}>
              <Checkbox
                isChecked={units.length > 0 && units.every(u => bulkUnits.includes(String(u.id)))}
                isIndeterminate={units.some(u => bulkUnits.includes(String(u.id))) && !units.every(u => bulkUnits.includes(String(u.id)))}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBulkUnits(units.map(u => String(u.id)));
                  } else {
                    setBulkUnits([]);
                  }
                }}
                colorScheme="blue"
                fontWeight="semibold"
              >
                Select All Units
              </Checkbox>
              <Divider />
              <CheckboxGroup 
                colorScheme="blue" 
                value={bulkUnits} 
                onChange={(values) => setBulkUnits(values)}
              >
                <SimpleGrid columns={1} spacing={2} width="100%">
                  {units.map((unit) => (
                    <Checkbox key={unit.id} value={String(unit.id)}>
                      {unit.name}
                    </Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
            </VStack>
          </Box>
          <Text 
            fontSize="xs" 
            color={bulkUnits.length === 0 ? "red.500" : "gray.500"} 
            fontWeight={bulkUnits.length === 0 ? "bold" : "normal"}
            mt={1}
          >
            {bulkUnits.length === 0 ? "Please select at least one unit" : `${bulkUnits.length} unit(s) selected`}
          </Text>
        </FormControl>
      )}
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={8}
                textAlign="center"
                width="100%"
                _hover={{ borderColor: "blue.500" }}
              >
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  display="none"
                  id="contract-bulk-upload"
                />
                <label htmlFor="contract-bulk-upload">
                  <VStack spacing={3} cursor="pointer">
                    <Icon as={FiUploadCloud} boxSize={10} color="blue.500" />
                    <Text fontWeight="medium">Upload Contracts File</Text>
                    <Text fontSize="sm" color={textColor}>
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </Text>
                    {bulkFile && bulkUploadTab === 0 && (
                      <Badge colorScheme="green">
                        Selected: {bulkFile.name}
                      </Badge>
                    )}
                  </VStack>
                </label>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Contracts Template Info</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Required columns: contract_type, vendor, contract_number,
                    start_date, end_date, sla_hours
                  </AlertDescription>
                </Box>
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => downloadSampleFile('contract')}
                >
                  Sample
                </Button>
              </Alert>
            </VStack>
          </TabPanel>

          <TabPanel p={0}>
            <VStack spacing={4} align="stretch" key={`bulk-vendors-${bulkUploadTab}`}>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={8}
                textAlign="center"
                width="100%"
                _hover={{ borderColor: "blue.500" }}
              >
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  display="none"
                  id="vendor-bulk-upload"
                />
                <label htmlFor="vendor-bulk-upload">
                  <VStack spacing={3} cursor="pointer">
                    <Icon as={FiUploadCloud} boxSize={10} color="blue.500" />
                    <Text fontWeight="medium">Upload Vendors File</Text>
                    <Text fontSize="sm" color={textColor}>
                      Supported formats: CSV, Excel (.xlsx, .xls)
                    </Text>
                    {bulkFile && bulkUploadTab === 1 && (
                      <Badge colorScheme="green">
                        Selected: {bulkFile.name}
                      </Badge>
                    )}
                  </VStack>
                </label>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Vendors Template Info</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Required columns: name, email, phone, address
                  </AlertDescription>
                </Box>
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => downloadSampleFile('vendor')}
                >
                  Sample
                </Button>
              </Alert>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={onBulkUploadClose} isDisabled={isBulkUploading}>
        Cancel
      </Button>
      <Button
        colorScheme="blue"
        onClick={handleBulkUpload}
        isLoading={isBulkUploading}
        loadingText="Uploading..."
        isDisabled={
          !bulkFile || 
          (userData?.role === "org_admin" && bulkUnits.length === 0)
        }
      >
        Upload & Process
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
      {/* Contract Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        size={{ base: "sm", md: "4xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          {selectedContract && (
            <>
              <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
                <VStack align="stretch" spacing={2}>
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "start", sm: "center" }}
                    gap={4}
                  >
                    <Heading size="md">
                      {selectedContract.contract_number}
                    </Heading>
                    {getStatusBadge(selectedContract)}
                  </Flex>
                  <Text color={textColor} fontSize="sm">
                    {selectedContract.contract_type} •{" "}
                    {selectedContract.vendor_name}
                  </Text>
                </VStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody p={{ base: 2, md: 6 }}>
                <Tabs colorScheme="blue" isFitted variant="line">
                  <TabList
                    position="sticky"
                    top="0"
                    zIndex="2"
                    bg={cardBg}
                    // pt={2}
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                  >
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Overview</Tab>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Assets</Tab>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Service</Tab>
                    <Tab fontSize={{ base: "xs", md: "sm" }}>Docs</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={{ base: 0, md: 4 }} pt={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card variant="outline">
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              <Box>
                                <Text fontSize="sm" color={textColor} fontWeight="medium">
                                  Contract Type
                                </Text>
                                <Tag
                                  colorScheme={
                                    selectedContract.contract_type === "CMC"
                                      ? "purple"
                                      : "blue"
                                  }
                                  size="md"
                                  mt={2}
                                >
                                  {selectedContract.contract_type}
                                </Tag>
                              </Box>
                              <Box>
                                <Text fontSize="sm" color={textColor} fontWeight="medium">
                                  Vendor Details
                                </Text>
                                <HStack mt={2} spacing={3}>
                                  <Avatar
                                    size="sm"
                                    name={selectedContract.vendor_name}
                                  />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="sm">
                                      {selectedContract.vendor_name}
                                    </Text>
                                    {selectedContract.vendor_phone && (
                                      <Text fontSize="xs" color={textColor}>
                                        {selectedContract.vendor_phone}
                                      </Text>
                                    )}
                                  </VStack>
                                </HStack>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card variant="outline">
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              <Box>
                                <Text fontSize="sm" color={textColor} fontWeight="medium">
                                  Contract Period
                                </Text>
                                <VStack align="start" spacing={2} mt={2}>
                                  <HStack fontSize="sm">
                                    <Icon as={FiCalendar} color="blue.500" />
                                    <Text fontWeight="medium">Starts:</Text>
                                    <Text>
                                      {format(
                                        parseISO(selectedContract.start_date),
                                        "MMM dd, yyyy",
                                      )}
                                    </Text>
                                  </HStack>
                                  <HStack fontSize="sm">
                                    <Icon as={FiCalendar} color="red.500" />
                                    <Text fontWeight="medium">Ends:</Text>
                                    <Text>
                                      {format(
                                        parseISO(selectedContract.end_date),
                                        "MMM dd, yyyy",
                                      )}
                                    </Text>
                                  </HStack>
                                  <Badge colorScheme="blue" variant="subtle" mt={1}>
                                    {differenceInDays(
                                      parseISO(selectedContract.end_date),
                                      parseISO(selectedContract.start_date),
                                    )}{" "}
                                    Days Total
                                  </Badge>
                                </VStack>
                              </Box>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card gridColumn={{ base: "span 1", md: "span 2" }} variant="outline">
                          <CardBody>
                            <VStack align="stretch" spacing={4}>
                              <Box>
                                <Text fontSize="sm" color={textColor} fontWeight="medium" mb={3}>
                                  Service Level Agreement (SLA)
                                </Text>
                                <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                                  <VStack
                                    align={{ base: "center", sm: "start" }}
                                    spacing={1}
                                    p={3}
                                    bg={bgColor}
                                    borderRadius="md"
                                  >
                                    <Text fontSize="xs" color={textColor} textTransform="uppercase">
                                      Response Time
                                    </Text>
                                    <Text fontWeight="bold" fontSize="lg">
                                      {selectedContract.sla_hours}h
                                    </Text>
                                  </VStack>
                                  <VStack
                                    align={{ base: "center", sm: "start" }}
                                    spacing={1}
                                    p={3}
                                    bg={bgColor}
                                    borderRadius="md"
                                  >
                                    <Text fontSize="xs" color={textColor} textTransform="uppercase">
                                      Status
                                    </Text>
                                    <Badge
                                      colorScheme={selectedContract.is_active ? "green" : "gray"}
                                    >
                                      {selectedContract.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </VStack>
                                  <VStack
                                    align={{ base: "center", sm: "start" }}
                                    spacing={1}
                                    p={3}
                                    bg={bgColor}
                                    borderRadius="md"
                                  >
                                    <Text fontSize="xs" color={textColor} textTransform="uppercase">
                                      Time Left
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      fontSize="lg"
                                      color={
                                        getDaysRemaining(selectedContract.end_date) < 30
                                          ? "orange.500"
                                          : "green.500"
                                      }
                                    >
                                      {getDaysRemaining(selectedContract.end_date)}d
                                    </Text>
                                  </VStack>
                                </SimpleGrid>
                              </Box>

                              {selectedContract.coverage_details && (
                                <Box pt={2}>
                                  <Text fontSize="sm" color={textColor} fontWeight="medium" mb={2}>
                                    Coverage Details
                                  </Text>
                                  <Box
                                    p={3}
                                    bg={bgColor}
                                    borderRadius="md"
                                    fontSize="sm"
                                    whiteSpace="pre-line"
                                  >
                                    {selectedContract.coverage_details}
                                  </Box>
                                </Box>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </TabPanel>

                    <TabPanel px={{ base: 0, md: 4 }} pt={4}>
                      {selectedAssets.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {selectedAssets.map((asset) => (
                            <Card key={asset.id} variant="outline">
                              <CardBody p={4}>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="start">
                                    <Box>
                                      <Heading size="xs" noOfLines={1}>
                                        {asset.asset_name}
                                      </Heading>
                                      <Text fontSize="xs" color={textColor}>
                                        {asset.asset_type}
                                      </Text>
                                    </Box>
                                    <Badge
                                      colorScheme={asset.status === "active" ? "green" : "red"}
                                      fontSize="10px"
                                    >
                                      {asset.status}
                                    </Badge>
                                  </Flex>

                                  <SimpleGrid columns={2} spacing={2} fontSize="xs">
                                    <Box>
                                      <Text color={textColor}>ID</Text>
                                      <Text fontWeight="medium">{asset.asset_id}</Text>
                                    </Box>
                                    <Box>
                                      <Text color={textColor}>Category</Text>
                                      <Text fontWeight="medium">{asset.category}</Text>
                                    </Box>
                                  </SimpleGrid>

                                  <Divider />

                                  <Flex justify="space-between">
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      leftIcon={<FiEye />}
                                      onClick={() => handleViewAsset(asset)}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="blue"
                                      leftIcon={<FiTool />}
                                      onClick={() => handleServiceRequest(asset)}
                                    >
                                      Service
                                    </Button>
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Center py={10}>
                          <VStack spacing={3}>
                            <Icon as={FiTool} boxSize={10} color="gray.300" />
                            <Text color={textColor} fontSize="sm">No assets linked</Text>
                          </VStack>
                        </Center>
                      )}
                    </TabPanel>

                    <TabPanel px={{ base: 0, md: 4 }} pt={4}>
                      <Center py={10}>
                        <VStack spacing={3}>
                          <Icon as={FiClock} boxSize={10} color="gray.300" />
                          <Text color={textColor} fontSize="sm">No service history</Text>
                        </VStack>
                      </Center>
                    </TabPanel>

                    <TabPanel px={{ base: 0, md: 4 }} pt={4}>
                      <Center py={10}>
                        <VStack spacing={4}>
                          <Icon as={FiFileText} boxSize={10} color="gray.300" />
                          <Text color={textColor} fontSize="sm">No documents</Text>
                          <Button
                            leftIcon={<FiUploadCloud />}
                            colorScheme="blue"
                            size="sm"
                            variant="outline"
                          >
                            Upload
                          </Button>
                        </VStack>
                      </Center>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              <ModalFooter borderTop="1px" borderColor={borderColor} p={4}>
                <Flex w="100%" gap={5} direction={{ base: "row", sm: "row" }}>
                  <Button
                    variant="outline"
                    leftIcon={<FiPrinter />}
                    onClick={handlePrint}
                    flex={{ base: "1", sm: "none" }}
                    size={{ base: "sm", md: "md" }}
                  >
                    Print
                  </Button>
                  <Spacer display={{ base: "none", sm: "block" }} />
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiEdit />}
                    onClick={() => {
                      onDetailClose();
                      handleEditContract(selectedContract);
                    }}
                    flex={{ base: "1", sm: "none" }}
                    size={{ base: "sm", md: "md" }}
                  >
                    Edit Contract
                  </Button>
                </Flex>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Vendor Details Drawer */}
      <Drawer
        isOpen={isVendorDrawerOpen}
        placement="right"
        onClose={onVendorDrawerClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="stretch" spacing={2}>
              <Avatar size="xl" name={selectedVendor?.name} />
              <Heading size="lg">{selectedVendor?.name}</Heading>
              <Badge
                colorScheme={selectedVendor?.is_active ? "green" : "gray"}
                width="fit-content"
              >
                {selectedVendor?.is_active ? "Active" : "Inactive"}
              </Badge>
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Heading size="sm" mb={4}>
                  Contact Information
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {selectedVendor?.email && (
                    <HStack>
                      <Icon as={FiMail} color={textColor} />
                      <Text>{selectedVendor.email}</Text>
                    </HStack>
                  )}
                  {selectedVendor?.phone && (
                    <HStack>
                      <Icon as={FiPhone} color={textColor} />
                      <Text>{selectedVendor.phone}</Text>
                    </HStack>
                  )}
                  {selectedVendor?.address && (
                    <HStack align="start">
                      <Icon as={FiMapPin} color={textColor} mt={1} />
                      <Text>{selectedVendor.address}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Heading size="sm" mb={4}>
                  Active Contracts
                </Heading>
                {contracts.filter((c) => c.vendor === selectedVendor?.id)
                  .length > 0 ? (
                  <VStack align="stretch" spacing={2}>
                    {contracts
                      .filter((c) => c.vendor === selectedVendor?.id)
                      .map((contract) => (
                        <Card key={contract.id} size="sm">
                          <CardBody p={3}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">
                                  {contract.contract_number}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                  {contract.contract_type}
                                </Text>
                              </VStack>
                              {getStatusBadge(contract)}
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                  </VStack>
                ) : (
                  <Text color={textColor}>No active contracts</Text>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        colorScheme={confirmConfig.colorScheme}
      />
    </Box>
  );
};

export default AMC;
