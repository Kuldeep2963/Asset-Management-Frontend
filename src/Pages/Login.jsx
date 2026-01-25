// LoginModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Checkbox,
  VStack,
  useToast,
  Icon,
  Card,
  CardBody,
  Center,
  HStack,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ForgotPasswordModal from "../Components/modals/ForgetPasswordmodal";

const LoginPage = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const BACKEND_API = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectBasedOnRole = (role, userData) => {
    login(
      userData.token.access,
      userData.token.refresh || "",
      userData,
      rememberMe,
    );

    onClose(); // 👈 close modal after login

    switch (role) {
      case "superadmin":
        navigate("/users");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  };

   const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  // Update handleForgotPassword function
  const handleForgotPassword = () => {
    // Store the email before opening modal
    localStorage.setItem('forgotPasswordEmail', email);
    setIsForgotPasswordOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_API}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await response.json();

      const userResponse = await api.get("api/me/", {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      const userData = {
        ...userResponse.data,
        token: {
          access: data.access,
          refresh: data.refresh,
        },
        email,
      };

      toast({
        title: "Login successful",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      redirectBasedOnRole(userData.role, userData);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={{base:"sm",md:"md"}}>
      <ModalOverlay />
      <ModalContent borderRadius="2xl">
        <ModalCloseButton />

        <ModalBody p={0}>
          <Card borderRadius="2xl">
            <CardBody p={6}>
              <VStack spacing={6}>
                <Center>
                  <Image src="assetcore1.png" h="50px" />
                </Center>

                <Box textAlign="center">
                  <Heading size="md">Welcome Back</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Sign in to your account
                  </Text>
                </Box>

                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                  <VStack spacing={4}>
                    {/* Email */}
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <EmailIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email"
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    {/* Password */}
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Enter password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement>
                          <Icon
                            as={showPassword ? ViewOffIcon : ViewIcon}
                            cursor="pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                    <HStack justify="space-between" w="full">
                      <Checkbox
                        isChecked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        colorScheme="blue"
                        size={{ base: "sm", md: "md" }}
                      >
                        <Text fontSize={{ base: "xs", md: "sm" }}>
                          Remember me
                        </Text>
                      </Checkbox>

                      <Button
                        variant="link"
                        colorScheme="blue"
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                         onClick={handleForgotPassword}
                        _hover={{ textDecoration: "underline" }}
                      >
                        Forgot Password?
                      </Button>
                    </HStack>
                    <Button
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      type="submit"
                      w="full"
                      _hover={{bg:"linear-gradient(135deg, #96a4e0 0%, #b89ed2 100%)"}}
                      isLoading={isLoading}
                      color={"white"}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </ModalBody>
      </ModalContent>
 <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={email}
      />
    </Modal>
  );
};

export default LoginPage;
