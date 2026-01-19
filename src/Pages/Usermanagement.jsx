import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  useToast,
  Flex,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spacer,
  Skeleton,
  Progress,
  Switch,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Checkbox,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiHome,
  FiUser,
  FiCheck,
  FiX,
  FiFilter,
  FiDownload,
  FiMail,
  FiPhone,
  FiShield,
  FiKey,
  FiRefreshCw,
  FiMoreVertical,
  FiEye,
  FiPackage,
} from "react-icons/fi";
import { BsFillBuildingFill } from "react-icons/bs";
import axios from "axios";

// API Configuration
const API_BASE_URL = "https://asset-management-backend-7y34.onrender.com";
// const BACKEND_API = import.meta.env.VITE_API_URL;

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    let accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      accessToken = sessionStorage.getItem("access_token");
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        let refreshToken = localStorage.getItem("refresh_token");
        const isSessionStorage = !refreshToken;
        if (!refreshToken) {
          refreshToken = sessionStorage.getItem("refresh_token");
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );

        if (isSessionStorage) {
          sessionStorage.setItem("access_token", response.data.access);
        } else {
          localStorage.setItem("access_token", response.data.access);
        }
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear storage and redirect to login if refresh fails
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

const UserManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState({
    organizations: false,
    admins: false,
    units: false,
    unitAdmins: false,
    users: false,
    departments: false,
  });
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAdmins: 0,
    totalUnits: 0,
    totalUnitAdmins: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
  });

  // Real data states
  const [organizations, setOrganizations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitAdmins, setUnitAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Edit states
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editingAdminData, setEditingAdminData] = useState({});

  // Form states
  const [newOrganization, setNewOrganization] = useState({
    name: "",
    status: "inactive",
  });
  const [newAdmin, setNewAdmin] = useState({
    organization: "",
    name: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "org_admin",
    can_manage_assets: false,
    can_manage_users: false,
  });
  const [newUnit, setNewUnit] = useState({
    organization: "",
    name: "",
  });

  const [newUnitAdmin, setNewUnitAdmin] = useState({
    unit: "",
    name: "",
    email: "",
    phone: "",
    can_manage_assets: false,
    can_manage_users: false,
  });
  const [newUser, setNewUser] = useState({
    unit: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    departments: [],
    organization: "",
  });

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    unit: "",
  });

  // Modals
  const {
    isOpen: isOrgOpen,
    onOpen: onOrgOpen,
    onClose: onOrgClose,
  } = useDisclosure();
  const {
    isOpen: isAdminOpen,
    onOpen: onAdminOpen,
    onClose: onAdminClose,
  } = useDisclosure();
  const {
    isOpen: isUnitOpen,
    onOpen: onUnitOpen,
    onClose: onUnitClose,
  } = useDisclosure();
  const {
    isOpen: isUnitAdminOpen,
    onOpen: onUnitAdminOpen,
    onClose: onUnitAdminClose,
  } = useDisclosure();
  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();
  const {
    isOpen: isDepartmentOpen,
    onOpen: onDepartmentOpen,
    onClose: onDepartmentClose,
  } = useDisclosure();

  // Get current user role
  useEffect(() => {
    let storedUser = localStorage.getItem("user");

    if (!storedUser) {
      storedUser = sessionStorage.getItem("user");
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserRole(parsedUser.role || "user");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserRole("user");
      }
    }
  }, []);

  useEffect(() => {
    if (userData?.organization?.id) {
      setNewUnit((prev) => ({
        ...prev,
        organization: userData.organization.id,
      }));
      setNewUnitAdmin((prev) => ({
        ...prev,
        organization: userData.organization.id,
      }));
    }
    // Set default unit for newDepartment if user is unit_admin
    if (userRole === "unit_admin" && userData?.unit?.id) {
      setNewDepartment((prev) => ({
        ...prev,
        unit: userData.unit.id,
      }));
    }
  }, [userData, userRole]);

  // Load data based on user role
  useEffect(() => {
    if (userRole) {
      fetchUserManagementData();
      if (userRole === "unit_admin" || userRole === "org_admin") {
        fetchDepartments();
      }
    }
  }, [userRole]);

  // Fetch departments separately
  const fetchDepartments = async () => {
    setLoading((prev) => ({ ...prev, departments: true }));
    try {
      const response = await api.get(`${API_BASE_URL}/api/departments/`);
      setDepartments(response.data || []);
      localStorage.setItem("departments", response.data);
      updateStats("totalDepartments", (response.data || []).length);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast({
        title: "Error loading departments",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  // Single API Function to fetch all user management data
  const fetchUserManagementData = async () => {
    setLoading({
      organizations: true,
      admins: true,
      units: true,
      unitAdmins: true,
      users: true,
      departments: true,
    });

    try {
      const response = await api.get(`${API_BASE_URL}/api/user-management/`);
      const data = response.data;

      if (userRole === "superadmin") {
        setOrganizations(data.organizations || []);
        setAdmins(data.org_admins || []);
        updateStats("totalOrganizations", (data.organizations || []).length);
        updateStats("totalAdmins", (data.org_admins || []).length);
      } else if (userRole === "org_admin") {
        setUnits(data.units || []);
        setUnitAdmins(data.unit_admins || []);
        setUsers([...(data.service_users || []), ...(data.viewers || [])]);
        updateStats("totalUnits", (data.units || []).length);
        updateStats("totalUnitAdmins", (data.unit_admins || []).length);
        updateStats(
          "totalUsers",
          (data.service_users || []).length + (data.viewers || []).length,
        );
        const activeUsers = [
          ...(data.service_users || []),
          ...(data.viewers || []),
        ].filter((u) => u.is_active).length;
        updateStats("activeUsers", activeUsers);
      } else if (userRole === "unit_admin") {
        setUsers([...(data.service_users || []), ...(data.viewers || [])]);
        updateStats(
          "totalUsers",
          (data.service_users || []).length + (data.viewers || []).length,
        );
        const activeUsers = [
          ...(data.service_users || []),
          ...(data.viewers || []),
        ].filter((u) => u.is_active).length;
        updateStats("activeUsers", activeUsers);
      }
    } catch (error) {
      console.error("Error loading user management data:", error);
      toast({
        title: "Error loading data",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading({
        organizations: false,
        admins: false,
        units: false,
        unitAdmins: false,
        users: false,
        departments: false,
      });
    }
  };

  const updateStats = (key, value) => {
    setStats((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    await fetchUserManagementData();
    if (userRole === "unit_admin" || userRole === "org_admin") {
      await fetchDepartments();
    }
  };

  // CRUD Operations
  const handleAddOrganization = async () => {
    try {
      if (!newOrganization.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Organization name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const organizationData = {
        name: newOrganization.name.trim(),
      };

      await api.post(`${API_BASE_URL}/api/organizations/`, organizationData);
      toast({
        title: "Organization added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
      onOrgClose();
      setNewOrganization({ name: "", status: "inactive" });
    } catch (error) {
      toast({
        title: "Error adding organization",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddAdmin = async () => {
    try {
      if (!newAdmin.organization) {
        toast({
          title: "Validation Error",
          description: "Please select an organization",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newAdmin.first_name.trim()) {
        toast({
          title: "Validation Error",
          description: "First name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newAdmin.last_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Last name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newAdmin.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const adminData = {
        organization: newAdmin.organization,
        first_name: newAdmin.first_name.trim(),
        last_name: newAdmin.last_name.trim(),
        email: newAdmin.email.trim(),
        role: "org_admin",
        can_manage_assets: newAdmin.can_manage_assets,
        can_manage_users: newAdmin.can_manage_users,
      };

      await api.post(`${API_BASE_URL}/api/users/`, adminData);
      toast({
        title: "Admin added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
      onAdminClose();
      setNewAdmin({
        organization: "",
        name: "",
        email: "",
        first_name: "",
        last_name: "",
        role: "org_admin",
      });
    } catch (error) {
      toast({
        title: "Error adding admin",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddUnit = async () => {
    try {
      if (!newUnit.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Unit name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const unitData = {
        organization: newUnit.organization,
        name: newUnit.name.trim(),
      };

      await api.post(`${API_BASE_URL}/api/units/`, unitData);
      toast({
        title: "Unit added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
      onUnitClose();
      setNewUnit({ organization: userData.organization.id, name: "" });
    } catch (error) {
      toast({
        title: "Error adding unit",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddUnitAdmin = async () => {
    try {
      if (!newUnitAdmin.unit) {
        toast({
          title: "Validation Error",
          description: "Please select a unit",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newUnitAdmin.first_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Unit admin first_name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      if (!newUnitAdmin.last_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Unit admin last_name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newUnitAdmin.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const unitAdminData = {
        unit: newUnitAdmin.unit,
        first_name: newUnitAdmin.first_name.trim(),
        last_name: newUnitAdmin.last_name.trim(),
        email: newUnitAdmin.email.trim(),
        can_manage_assets: newUnitAdmin.can_manage_assets,
        can_manage_users: newUnitAdmin.can_manage_users,
        role: "unit_admin",
        organization: userData.organization.id,
      };

      await api.post(`${API_BASE_URL}/api/users/`, unitAdminData);
      toast({
        title: "Unit admin added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
      onUnitAdminClose();
      setNewUnitAdmin({
        unit: "",
        name: "",
        email: "",
        phone: "",
        can_manage_assets: false,
        can_manage_users: false,
        role: "unit_admin",
        organization: userData.organization.id,
      });
    } catch (error) {
      toast({
        title: "Error adding unit admin",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const userPayload = {
        ...newUser,
        departments: newUser.departments,
      };
      await api.post(`${API_BASE_URL}/api/users/`, userPayload);
      toast({
        title: "User added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
      onUserClose();
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
        departments: [],
        unit: userData?.unit?.id || "",
        organization: userData?.organization?.id || "",
      });
    } catch (error) {
      toast({
        title: "Error adding user",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`${API_BASE_URL}/api/users/${userId}/`);

      toast({
        title: "User deleted successfully",
        status: "success",
        duration: 3000,
      });

      await fetchUserManagementData(); // refresh list
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleAddDepartment = async () => {
    try {
      if (!newDepartment.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Department name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!newDepartment.unit) {
        toast({
          title: "Validation Error",
          description: "Unit is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const departmentData = {
        name: newDepartment.name.trim(),
        unit: newDepartment.unit,
      };

      await api.post(`${API_BASE_URL}/api/departments/`, departmentData);
      toast({
        title: "Department added successfully",
        status: "success",
        duration: 3000,
      });
      await fetchDepartments();
      onDepartmentClose();
      setNewDepartment({
        name: "",
        unit: userRole === "unit_admin" ? userData?.unit?.id || "" : "",
      });
    } catch (error) {
      toast({
        title: "Error adding department",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteOrganization = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) {
      return;
    }
    try {
      await api.delete(`${API_BASE_URL}/api/organizations/${id}/`);
      toast({
        title: "Organization deleted",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
    } catch (error) {
      toast({
        title: "Error deleting organization",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }
    try {
      await api.delete(`${API_BASE_URL}/api/users/${id}/`);
      toast({
        title: "Admin deleted",
        status: "success",
        duration: 3000,
      });
      await fetchUserManagementData();
    } catch (error) {
      toast({
        title: "Error deleting admin",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setEditingAdminData({
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
    });
  };

  const handleSaveAdmin = async () => {
    try {
      if (!editingAdminData.first_name.trim()) {
        toast({
          title: "Validation Error",
          description: "First name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!editingAdminData.last_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Last name is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      if (!editingAdminData.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      const updateData = {
        first_name: editingAdminData.first_name.trim(),
        last_name: editingAdminData.last_name.trim(),
        email: editingAdminData.email.trim(),
      };

      await api.patch(
        `${API_BASE_URL}/api/users/${editingAdminId}/`,
        updateData,
      );

      toast({
        title: "Admin updated successfully",
        status: "success",
        duration: 3000,
      });

      await fetchUserManagementData();
      setEditingAdminId(null);
      setEditingAdminData({});
    } catch (error) {
      toast({
        title: "Error updating admin",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAdminId(null);
    setEditingAdminData({});
  };

  const handleToggleStatus = async (type, id, currentStatus) => {
    try {
      const endpoint = `/${type}/${id}/`;
      const newStatus = !currentStatus;
      await api.patch(endpoint, { is_active: newStatus });

      toast({
        title: `Status updated successfully`,
        status: "success",
        duration: 3000,
      });

      await fetchUserManagementData();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get("/export/users/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Error exporting data",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  // Filter data based on search
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAdmins = admins.filter((admin) =>
    // admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredUnitAdmins = unitAdmins.filter(
    (unitAdmin) =>
      unitAdmin.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unitAdmin.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unitAdmin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unitAdmin.unit.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading Skeletons
  const TableSkeleton = ({ rows = 5, columns = 6 }) => (
    <VStack spacing={4} align="stretch">
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} height="40px" borderRadius="md" />
      ))}
    </VStack>
  );
  const statsConfig = {
  superadmin: {
    columns: 6,
    items: [
      { key: "organizations", label: "Organizations", color: "teal" },
      { key: "admins", label: "Admins", color: "blue" },
      { key: "units", label: "Units", color: "orange" },
      { key: "unitAdmins", label: "Unit Admins", color: "purple" },
      { key: "totalUsers", label: "Total Users", color: "cyan" },
      { key: "activeUsers", label: "Active Users", color: "green" },
    ],
  },
  org_admin: {
    columns: 5,
    items: [
      { key: "admins", label: "Admins", color: "blue" },
      { key: "units", label: "Units", color: "orange" },
      { key: "unitAdmins", label: "Unit Admins", color: "purple" },
      { key: "totalUsers", label: "Total Users", color: "cyan" },
      { key: "activeUsers", label: "Active Users", color: "green" },
    ],
  },
  unit_admin: {
    columns: 3,
    items: [
      { key: "units", label: "Units", color: "orange" },
      { key: "totalUsers", label: "Total Users", color: "cyan" },
      { key: "activeUsers", label: "Active Users", color: "green" },
    ],
  },
};

const userConfig = statsConfig[userRole] || statsConfig.unit_admin;


  return (
    <Box
      mb={{ base: "50px", md: "0" }}
      py={{ base: 4, md: 8 }}
      pt={{ base: 0, md: 8 }}
      px={{ base: 4, md: 8 }}
      minH="100vh"
      bg="gray.50"
    >
      {/* Header Section */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size={{ base: "md", md: "xl" }}>User Management</Heading>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size={{ base: "xs", md: "sm" }}
              onClick={handleRefresh}
              isLoading={
                loading.organizations ||
                loading.admins ||
                loading.units ||
                loading.unitAdmins ||
                loading.users ||
                loading.departments
              }
            >
              <Text display={{ base: "none", md: "block" }}>Refresh</Text>
            </Button>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              colorScheme="blue"
              size={{ base: "xs", md: "sm" }}
              onClick={handleExportData}
            >
              <Text>Export Data</Text>
            </Button>
          </HStack>
        </Flex>
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
          Manage organizations, admins, units, unit admins, and users in the
          asset management system
        </Text>
      </Box>
      {/* Stats Overview */}

<SimpleGrid 
  columns={{ base: 2, md: 3, lg: userConfig.columns }} 
  spacing={4} 
  mb={6}
>
  {userConfig.items.map((item, idx) => (
    <Card key={idx} bg="white" border="1px" borderColor="gray.200">
      <CardBody>
        <Stat>
          <StatLabel>{item.label}</StatLabel>
          <StatNumber color={`${item.color}.500`}>
            {loading[item.key] ? (
              <Skeleton height="20px" width="50px" />
            ) : (
              stats[`total${item.label.replace(/\s+/g, '')}`] || 
              stats[item.key] ||
              0
            )}
          </StatNumber>
        </Stat>
      </CardBody>
    </Card>
  ))}
</SimpleGrid>

      {/* Main Content with Tabs */}
      {userRole ? (
        <Tabs
          variant="line"
          colorScheme="blue"
          onChange={setSelectedTab}
          index={selectedTab}
        >
          <TabList mb={4} gap={{ base: 4, md: 10 }}>
            {userRole === "superadmin" && (
              <>
                <Tab>
                  <HStack>
                    <BsFillBuildingFill />
                    <Text>Organizations</Text>
                    <Badge colorScheme="green">{organizations.length}</Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiUser />
                    <Text>Admins</Text>
                    <Badge colorScheme="blue">{admins.length}</Badge>
                  </HStack>
                </Tab>
              </>
            )}
            {userRole === "org_admin" && (
              <>
                <Tab>
                  <HStack>
                    <FiHome />
                    <Text display={{ base: "none", md: "block" }}>Units</Text>
                    <Badge colorScheme="orange">{units.length}</Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiShield />
                    <Text display={{ base: "none", md: "block" }}>
                      Unit Admins
                    </Text>
                    <Badge colorScheme="purple">{unitAdmins.length}</Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiHome />
                    <Text display={{ base: "none", md: "block" }}>
                      Departments
                    </Text>
                    <Badge colorScheme="orange">{departments.length}</Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiUsers />
                    <Text display={{ base: "none", md: "block" }}>Users</Text>
                    <Badge colorScheme="cyan">{users.length}</Badge>
                  </HStack>
                </Tab>
              </>
            )}
            {userRole === "unit_admin" && (
              <>
                <Tab>
                  <HStack>
                    <FiHome />
                    <Text>Departments</Text>
                    <Badge colorScheme="orange">{departments.length}</Badge>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiUsers />
                    <Text>Users</Text>
                    <Badge colorScheme="cyan">{users.length}</Badge>
                  </HStack>
                </Tab>
              </>
            )}
          </TabList>

          <TabPanels>
            {/* Organizations Tab */}
            {userRole === "superadmin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4} gap={4}>
                      <Heading size="md">Organizations</Heading>
                      <Spacer />
                      <InputGroup flex="1" maxW="300px">
                        <InputLeftElement pointerEvents="none">
                          <FiSearch color="gray.300" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search organizations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="teal"
                        size="sm"
                        onClick={onOrgOpen}
                      >
                        Add Organization
                      </Button>
                    </Flex>

                    {loading.organizations ? (
                      <TableSkeleton rows={3} columns={5} />
                    ) : (
                      <>
                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredOrganizations.map((org) => (
                            <Card
                              key={org.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" fontSize="lg">
                                      {org.name}
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        org.status === "active"
                                          ? "green"
                                          : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {org.status}
                                    </Badge>
                                  </Flex>

                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.500">
                                      Status Toggle
                                    </Text>
                                    <Switch
                                      size="sm"
                                      isChecked={org.status === "active"}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "organizations",
                                          org.id,
                                          org.status,
                                        )
                                      }
                                    />
                                  </Flex>

                                  <Box>
                                    <Text fontSize="xs" color="gray.500">
                                      Created At
                                    </Text>
                                    <Text fontSize="sm">
                                      {new Date(
                                        org.created_at,
                                      ).toLocaleDateString()}
                                    </Text>
                                  </Box>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit organization"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete organization"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        handleDeleteOrganization(org.id)
                                      }
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead>
                            <Tr bg="gray.200">
                              <Th color="gray.700">Name</Th>
                              <Th color="gray.700">Status</Th>
                              <Th color="gray.700">Created</Th>
                              <Th color="gray.700">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredOrganizations.map((org) => (
                              <Tr key={org.id}>
                                <Td fontWeight="medium">{org.name}</Td>
                                <Td>
                                  <Flex align="center" gap={2}>
                                    <Badge
                                      colorScheme={
                                        org.status === "active"
                                          ? "green"
                                          : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {org.status}
                                    </Badge>
                                    <Switch
                                      size="sm"
                                      isChecked={org.status === "active"}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "organizations",
                                          org.id,
                                          org.status,
                                        )
                                      }
                                    />
                                  </Flex>
                                </Td>
                                <Td>
                                  {new Date(
                                    org.created_at,
                                  ).toLocaleDateString()}
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <IconButton
                                      aria-label="Edit organization"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete organization"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        handleDeleteOrganization(org.id)
                                      }
                                    />
                                    <Menu>
                                      <MenuButton
                                        as={IconButton}
                                        icon={<FiMoreVertical />}
                                        size="sm"
                                        variant="ghost"
                                      />
                                      <MenuList>
                                        <MenuItem icon={<FiEye />}>
                                          View Details
                                        </MenuItem>
                                        <MenuItem icon={<FiUserPlus />}>
                                          Add Admin
                                        </MenuItem>
                                        <MenuDivider />
                                        <MenuItem
                                          icon={<FiTrash2 />}
                                          color="red.500"
                                        >
                                          Delete
                                        </MenuItem>
                                      </MenuList>
                                    </Menu>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}

            {/* Admins Tab */}
            {userRole === "superadmin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Organization Admins</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="sm"
                        onClick={onAdminOpen}
                      >
                        Add Admin
                      </Button>
                    </Flex>

                    {loading.admins ? (
                      <TableSkeleton rows={3} columns={5} />
                    ) : (
                      <>
                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredAdmins.map((admin) => (
                            <Card
                              key={admin.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack>
                                      <Avatar
                                        size="sm"
                                        name={`${admin.first_name} ${admin.last_name}`}
                                      />
                                      <Box>
                                        <Text fontWeight="bold">
                                          {admin.first_name} {admin.last_name}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {admin.organization?.name}
                                        </Text>
                                      </Box>
                                    </HStack>
                                    <Badge
                                      colorScheme={
                                        admin.is_active ? "green" : "gray"
                                      }
                                    >
                                      {admin.is_active ? "active" : "inactive"}
                                    </Badge>
                                  </Flex>

                                  <HStack>
                                    <FiMail size={14} />
                                    <Text fontSize="sm">{admin.email}</Text>
                                  </HStack>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit admin"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditAdmin(admin)}
                                    />
                                    <IconButton
                                      aria-label="Delete admin"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        handleDeleteAdmin(admin.id)
                                      }
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead>
                            <Tr bg="gray.200">
                              <Th color="gray.700">Name</Th>
                              <Th color="gray.700">Email</Th>
                              <Th color="gray.700">Organization</Th>
                              <Th color="gray.700">Status</Th>
                              <Th color="gray.700">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredAdmins.map((admin) => (
                              <Tr key={admin.id}>
                                <Td fontWeight="medium">
                                  {editingAdminId === admin.id ? (
                                    <HStack spacing={2}>
                                      <Input
                                        size="sm"
                                        value={editingAdminData.first_name}
                                        onChange={(e) =>
                                          setEditingAdminData({
                                            ...editingAdminData,
                                            first_name: e.target.value,
                                          })
                                        }
                                        placeholder="First name"
                                      />
                                      <Input
                                        size="sm"
                                        value={editingAdminData.last_name}
                                        onChange={(e) =>
                                          setEditingAdminData({
                                            ...editingAdminData,
                                            last_name: e.target.value,
                                          })
                                        }
                                        placeholder="Last name"
                                      />
                                    </HStack>
                                  ) : (
                                    `${admin.first_name} ${admin.last_name}`
                                  )}
                                </Td>
                                <Td>
                                  {editingAdminId === admin.id ? (
                                    <Input
                                      size="sm"
                                      value={editingAdminData.email}
                                      onChange={(e) =>
                                        setEditingAdminData({
                                          ...editingAdminData,
                                          email: e.target.value,
                                        })
                                      }
                                      placeholder="Email"
                                    />
                                  ) : (
                                    <HStack>
                                      <FiMail color="red" size={14} />
                                      <Text fontSize="sm">{admin.email}</Text>
                                    </HStack>
                                  )}
                                </Td>
                                <Td fontWeight={"semibold"}>
                                  {admin.organization.name}
                                </Td>
                                <Td>
                                  <Flex align="center" gap={2}>
                                    <Badge
                                      colorScheme={
                                        admin.status === "active"
                                          ? "green"
                                          : "gray"
                                      }
                                    >
                                      {admin.is_active}
                                    </Badge>
                                    <Switch
                                      size="sm"
                                      isChecked={admin.is_active}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "admins",
                                          admin.id,
                                          admin.is_active,
                                        )
                                      }
                                    />
                                  </Flex>
                                </Td>
                                <Td>
                                  {editingAdminId === admin.id ? (
                                    <HStack spacing={2}>
                                      <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={handleSaveAdmin}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                      >
                                        Cancel
                                      </Button>
                                    </HStack>
                                  ) : (
                                    <HStack spacing={2}>
                                      <IconButton
                                        aria-label="Edit admin"
                                        icon={<FiEdit2 />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditAdmin(admin)}
                                      />
                                      <IconButton
                                        aria-label="Delete admin"
                                        icon={<FiTrash2 />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() =>
                                          handleDeleteAdmin(admin.id)
                                        }
                                      />
                                    </HStack>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}

            {/* Units Tab - For Admin Role */}
            {userRole === "org_admin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Units</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="teal"
                        size="sm"
                        onClick={onUnitOpen}
                      >
                        Add Unit
                      </Button>
                    </Flex>

                    {loading.units ? (
                      <VStack spacing={4}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} height="120px" borderRadius="md" />
                        ))}
                      </VStack>
                    ) : (
                      <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={4}
                      >
                        {units.map((unit) => (
                          <Card
                            key={unit.id}
                            border="1px"
                            borderColor="gray.200"
                          >
                            <CardBody>
                              <Flex
                                justify="space-between"
                                align="start"
                                mb={2}
                              >
                                <Box>
                                  <Heading size="sm" mb={1}>
                                    {unit.name}
                                  </Heading>
                                  <Tag size="sm" mb={2}>
                                    {unit.code}
                                  </Tag>
                                </Box>
                                <Badge
                                  colorScheme={
                                    unit.status === "active" ? "green" : "gray"
                                  }
                                >
                                  {unit.status}
                                </Badge>
                              </Flex>
                              <Text fontSize="sm" color="gray.600" mb={3}>
                                {unit.organization_name}
                              </Text>
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                  <FiUser color="blue"/>
                                  <Text fontSize="md">
                                     {unit.user_count} users
                                  </Text>
                                  </HStack>
                                  <HStack>
                                  <FiPackage color="green"/> 
                                  <Text fontSize="md">
                                    {unit.asset_count} assets
                                  </Text>
                                  </HStack>
                                </VStack>
                                <HStack spacing={2}>
                                  <Button
                                    aria-label="Add department"
                                    leftIcon={<FiPlus />}
                                    size="sm"
                                    variant="outline"
                                    colorScheme="teal"
                                    onClick={() => {
                                      setNewDepartment({
                                        name: "",
                                        unit: unit.id,
                                      });
                                      onDepartmentOpen();
                                    }}
                                  >
                                    Add Department
                                   </Button>
                                  <Button
                                    aria-label="Manage unit"
                                    leftIcon={<FiEdit2 />}
                                    size="sm"
                                    variant="outline"
                                    colorScheme="blue"
                                  >
                                    Edit
                                    </Button>
                                </HStack>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}

            {/* Unit Admins Tab - For Admin Role */}
            {userRole === "org_admin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Unit Administrators</Heading>

                      <Flex align="center" gap={3}>
                        <Button
                          leftIcon={<FiPlus />}
                          colorScheme="teal"
                          size="sm"
                          onClick={onUnitAdminOpen}
                        >
                          Add Unit Admin
                        </Button>
                      </Flex>
                    </Flex>
                    <InputGroup w="300px" mb={4}>
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search unit admins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>

                    {loading.unitAdmins ? (
                      <TableSkeleton rows={3} columns={7} />
                    ) : (
                      <>
                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredUnitAdmins.map((unitAdmin) => (
                            <Card
                              key={unitAdmin.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack>
                                      <Avatar
                                        size="sm"
                                        name={`${unitAdmin.first_name} ${unitAdmin.last_name}`}
                                        bg="purple.500"
                                      />
                                      <Box>
                                        <Text fontWeight="bold">
                                          {unitAdmin.first_name}{" "}
                                          {unitAdmin.last_name}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {unitAdmin.unit?.name}
                                        </Text>
                                      </Box>
                                    </HStack>
                                    <Badge
                                      colorScheme={
                                        unitAdmin.is_active ? "green" : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {unitAdmin.is_active
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>
                                  </Flex>

                                  <HStack>
                                    <FiMail size={14} />
                                    <Text fontSize="sm">{unitAdmin.email}</Text>
                                  </HStack>

                                  <Flex justify="space-between">
                                    <Text fontSize="xs" color="gray.500">
                                      Last Login
                                    </Text>
                                    <Text fontSize="xs">
                                      {unitAdmin.last_login
                                        ? new Date(
                                            unitAdmin.last_login,
                                          ).toLocaleDateString()
                                        : "Never"}
                                    </Text>
                                  </Flex>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit unit admin"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Reset password"
                                      icon={<FiKey />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="orange"
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead bg={"gray.200"}>
                            <Tr>
                              <Th color={"gray.800"}>Name</Th>
                              <Th color={"gray.800"}>Email</Th>
                              <Th color={"gray.800"}>Unit</Th>
                              <Th color={"gray.800"}>Status</Th>
                              <Th color={"gray.800"}>Last Login</Th>
                              <Th color={"gray.800"}>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredUnitAdmins.map((unitAdmin) => (
                              <Tr key={unitAdmin.id}>
                                <Td>
                                  <HStack>
                                    <Avatar
                                      size="xs"
                                      name={unitAdmin.name}
                                      bg="purple.500"
                                    />
                                    <Text fontWeight="medium">
                                      {unitAdmin.first_name}{" "}
                                      {unitAdmin.last_name}
                                    </Text>
                                  </HStack>
                                </Td>
                                <Td>{unitAdmin.email}</Td>
                                <Td>{unitAdmin.unit.name}</Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      unitAdmin.is_active ? "green" : "gray"
                                    }
                                    variant="subtle"
                                  >
                                    {unitAdmin.is_active
                                      ? "Active"
                                      : "Inactive"}
                                  </Badge>
                                </Td>
                                <Td>
                                  {unitAdmin.last_login
                                    ? new Date(
                                        unitAdmin.last_login,
                                      ).toLocaleDateString()
                                    : "Never"}
                                </Td>
                                <Td>
                                  <IconButton
                                    aria-label="Edit unit admin"
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <IconButton
                                    aria-label="Reset password"
                                    icon={<FiKey />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="orange"
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}
            {(userRole === "unit_admin" || userRole === "org_admin") && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Departments</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="teal"
                        size="sm"
                        onClick={() => {
                          setNewDepartment({
                            name: "",
                            unit: userData?.unit?.id || "",
                          });
                          onDepartmentOpen();
                        }}
                      >
                        Add Department
                      </Button>
                    </Flex>

                    {loading.departments ? (
                      <TableSkeleton rows={3} columns={4} />
                    ) : (
                      <>
                        <InputGroup mb={4}>
                          <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray.300" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>

                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredDepartments.map((dept) => (
                            <Card
                              key={dept.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={2}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {dept.name}
                                  </Text>
                                  <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.500">
                                      Unit
                                    </Text>
                                    <Text fontSize="sm">
                                      {dept.unit_name || dept.unit}
                                    </Text>
                                  </HStack>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit department"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete department"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead bg={"gray.200"}>
                            <Tr>
                              <Th>Name</Th>
                              <Th>Unit</Th>
                              <Th>Total Users</Th>
                              <Th>Total Assets</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredDepartments.map((dept) => (
                              <Tr key={dept.id}>
                                <Td fontWeight="medium">{dept.name}</Td>
                                <Td>{dept.unit_name || dept.unit}</Td>
                                <Td>{dept.user_count}</Td>
                                <Td>{dept.asset_count}</Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <IconButton
                                      aria-label="Edit department"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete department"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}
            {/* Users Tab - For Org Admin Role */}
            {userRole === "org_admin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4} gap={4}>
                      <Heading size="md">Users</Heading>
                      <Spacer />

                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="teal"
                        size="sm"
                        onClick={onUserOpen}
                      >
                        Add User
                      </Button>
                    </Flex>
                    <InputGroup mb={4}>
                      <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>

                    {loading.users ? (
                      <TableSkeleton rows={3} columns={6} />
                    ) : (
                      <>
                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredUsers.map((user) => (
                            <Card
                              key={user.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack>
                                      <Avatar
                                        size="sm"
                                        name={`${user.first_name} ${user.last_name}`}
                                      />
                                      <Box>
                                        <Text fontWeight="bold">
                                          {user.first_name} {user.last_name}
                                        </Text>
                                        <Tag
                                          px={2}
                                          size="xs"
                                          colorScheme="blue"
                                        >
                                          {user.role}
                                        </Tag>
                                      </Box>
                                    </HStack>
                                    <Badge
                                      colorScheme={
                                        user.is_active ? "green" : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {user.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </Flex>

                                  <HStack>
                                    <FiMail size={14} />
                                    <Text fontSize="sm">{user.email}</Text>
                                  </HStack>

                                  <Box>
                                    <Text fontSize="xs" color="gray.500">
                                      Departments
                                    </Text>
                                    <Text fontSize="sm">
                                      {user.departments &&
                                      user.departments.length > 0
                                        ? user.departments
                                            .map((dep) => dep.name)
                                            .join(", ")
                                        : "N/A"}
                                    </Text>
                                  </Box>

                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.500">
                                      Status
                                    </Text>
                                    <Switch
                                      size="sm"
                                      isChecked={user.is_active}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "users",
                                          user.id,
                                          user.is_active,
                                        )
                                      }
                                    />
                                  </Flex>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit user"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete user"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead>
                            <Tr bg="gray.200">
                              <Th color="gray.700">Name</Th>
                              <Th color="gray.700">Email</Th>
                              <Th color="gray.700">Role</Th>
                              <Th color="gray.700">Department</Th>
                              <Th color="gray.700">Status</Th>
                              <Th color="gray.700">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredUsers.map((user) => (
                              <Tr key={user.id}>
                                <Td>
                                  <HStack>
                                    <Avatar
                                      size="sm"
                                      name={`${user.first_name} ${user.last_name}`}
                                    />
                                    <Text fontWeight="medium">
                                      {user.first_name} {user.last_name}
                                    </Text>
                                  </HStack>
                                </Td>
                                <Td>{user.email}</Td>
                                <Td>
                                  <Tag size="sm" colorScheme="blue">
                                    {user.role}
                                  </Tag>
                                </Td>
                                <Td>
                                  {user.departments &&
                                  user.departments.length > 0
                                    ? user.departments
                                        .map((dep) => dep.name)
                                        .join(", ")
                                    : "N/A"}
                                </Td>
                                <Td>
                                  <Flex align="center" gap={2}>
                                    <Badge
                                      colorScheme={
                                        user.is_active ? "green" : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {user.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    <Switch
                                      size="sm"
                                      isChecked={user.is_active}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "users",
                                          user.id,
                                          user.is_active,
                                        )
                                      }
                                    />
                                  </Flex>
                                </Td>
                                <Td>
                                  <IconButton
                                    aria-label="Edit user"
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <IconButton
                                    aria-label="Delete user"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}

            {/* Departments Tab - For Unit Admin Role */}

            {/* Users Tab - For Unit Admin Role */}
            {userRole === "unit_admin" && (
              <TabPanel p={0}>
                <Card border="1px" borderColor="gray.200">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md">Users</Heading>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="teal"
                        size="sm"
                        onClick={() => {
                          setNewUser({
                            first_name: "",
                            last_name: "",
                            email: "",
                            phone: "",
                            role: "",
                            departments: [],
                            unit: userData?.unit?.id || "",
                            organization: userData?.organization?.id || "",
                          });
                          onUserOpen();
                        }}
                      >
                        Add User
                      </Button>
                    </Flex>

                    {loading.users ? (
                      <TableSkeleton rows={3} columns={6} />
                    ) : (
                      <>
                        <InputGroup mb={4}>
                          <InputLeftElement pointerEvents="none">
                            <FiSearch color="gray.300" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </InputGroup>

                        {/* Mobile view */}
                        <SimpleGrid
                          columns={1}
                          spacing={4}
                          display={{ base: "grid", md: "none" }}
                        >
                          {filteredUsers.map((user) => (
                            <Card
                              key={user.id}
                              border="1px"
                              borderColor="gray.200"
                              variant="outline"
                            >
                              <CardBody>
                                <VStack align="stretch" spacing={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack>
                                      <Avatar
                                        size="sm"
                                        name={`${user.first_name} ${user.last_name}`}
                                      />
                                      <Box>
                                        <Text fontWeight="bold">
                                          {user.first_name} {user.last_name}
                                        </Text>
                                        <Tag size="xs" colorScheme="blue">
                                          {user.role}
                                        </Tag>
                                      </Box>
                                    </HStack>
                                    <Badge
                                      colorScheme={
                                        user.is_active ? "green" : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {user.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </Flex>

                                  <HStack>
                                    <FiMail size={14} />
                                    <Text fontSize="sm">{user.email}</Text>
                                  </HStack>

                                  <Box>
                                    <Text fontSize="xs" color="gray.500">
                                      Departments
                                    </Text>
                                    <Text fontSize="sm">
                                      {user.departments &&
                                      user.departments.length > 0
                                        ? user.departments
                                            .map((dep) => dep.name)
                                            .join(", ")
                                        : "N/A"}
                                    </Text>
                                  </Box>

                                  <Flex justify="space-between" align="center">
                                    <Text fontSize="sm" color="gray.500">
                                      Status
                                    </Text>
                                    <Switch
                                      size="sm"
                                      isChecked={user.is_active}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "users",
                                          user.id,
                                          user.is_active,
                                        )
                                      }
                                    />
                                  </Flex>

                                  <Divider />

                                  <Flex justify="flex-end" gap={2}>
                                    <IconButton
                                      aria-label="Edit user"
                                      icon={<FiEdit2 />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <IconButton
                                      aria-label="Delete user"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => handleDeleteUser(user.id)}
                                    />
                                  </Flex>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>

                        {/* Desktop view */}
                        <Table
                          variant="simple"
                          display={{ base: "none", md: "table" }}
                        >
                          <Thead bg={"gray.200"}>
                            <Tr>
                              <Th>Name</Th>
                              <Th>Email</Th>
                              <Th>Role</Th>
                              <Th>Department</Th>
                              <Th>Status</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredUsers.map((user) => (
                              <Tr key={user.id}>
                                <Td>
                                  <HStack>
                                    <Avatar size="sm" name={user.name} />
                                    <Text fontWeight="medium">
                                      {user.first_name} {user.last_name}
                                    </Text>
                                  </HStack>
                                </Td>
                                <Td>{user.email}</Td>
                                <Td>
                                  <Tag size="sm" colorScheme="blue">
                                    {user.role}
                                  </Tag>
                                </Td>
                                <Td>
                                  {user.departments &&
                                  user.departments.length > 0
                                    ? user.departments
                                        .map((dep) => dep.name)
                                        .join(", ")
                                    : "N/A"}
                                </Td>
                                <Td>
                                  <Flex align="center" gap={2}>
                                    <Badge
                                      colorScheme={
                                        user.status === "active"
                                          ? "green"
                                          : "gray"
                                      }
                                      variant="subtle"
                                    >
                                      {user.is_active}
                                    </Badge>
                                    <Switch
                                      size="sm"
                                      isChecked={user.is_active}
                                      onChange={() =>
                                        handleToggleStatus(
                                          "users",
                                          user.id,
                                          user.is_active,
                                        )
                                      }
                                    />
                                  </Flex>
                                </Td>
                                <Td>
                                  <IconButton
                                    aria-label="Edit user"
                                    icon={<FiEdit2 />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <IconButton
                                    aria-label="Delete user"
                                    icon={<FiTrash2 />}
                                    onClick={() => handleDeleteUser(user.id)}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      ) : (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <AlertDescription>
            No user role found. Please log in again.
          </AlertDescription>
        </Alert>
      )}

      {/* Modal Forms - Updated with real form handlers */}
      {/* Add Organization Modal */}
      <Modal isOpen={isOrgOpen} onClose={onOrgClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add New Organization
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Organization Name</FormLabel>
                <Input
                  placeholder="Enter organization name"
                  value={newOrganization.name}
                  onChange={(e) =>
                    setNewOrganization({
                      ...newOrganization,
                      name: e.target.value,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onOrgClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddOrganization}>
              Create Organization
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAdminOpen}
        onClose={onAdminClose}
        size={{ base: "sm", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add Organization Admin
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
            <Button variant="ghost" mr={3} onClick={onAdminClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddAdmin}>
              Add Admin
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isUnitOpen}
        onClose={onUnitClose}
        size={{ base: "sm", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add New Unit
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Unit Name</FormLabel>
                <Input
                  placeholder="Enter unit name"
                  value={newUnit.name}
                  onChange={(e) =>
                    setNewUnit({ ...newUnit, name: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUnitClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddUnit}>
              Create Unit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Unit Admin Modal */}
      <Modal
        isOpen={isUnitAdminOpen}
        onClose={onUnitAdminClose}
        size={{ base: "sm", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add Unit Administrator
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

              {/* <FormControl>
                <FormLabel>User Limit</FormLabel>
                <NumberInput 
                  min={1} 
                  max={100} 
                  value={newUnitAdmin.user_limit}
                  onChange={(value) => setNewUnitAdmin({...newUnitAdmin, user_limit: parseInt(value)})}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Maximum number of users this admin can create
                </Text>
              </FormControl> */}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUnitAdminClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddUnitAdmin}>
              Create Unit Admin
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isUserOpen}
        onClose={onUserClose}
        size={{ base: "sm", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add New User
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4}>
              {userRole === "org_admin" && (
                <FormControl isRequired>
                  <FormLabel>Select Unit</FormLabel>
                  <Select
                    placeholder="Select unit"
                    value={newUser.unit}
                    onChange={(e) =>
                      setNewUser({ ...newUser, unit: e.target.value })
                    }
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.organization_name})
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
                <VStack align="start" spacing={2}>
                  {departments.map((dept) => (
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
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUserClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddUser}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Department Modal */}
      <Modal
        isOpen={isDepartmentOpen}
        onClose={onDepartmentClose}
        size={{ base: "sm", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="teal.600" color="white">
            Add Department
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
            <Button variant="ghost" mr={3} onClick={onDepartmentClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleAddDepartment}>
              Add Department
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
