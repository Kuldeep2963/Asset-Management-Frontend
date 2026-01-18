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
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import api from "../../services/api";

const AssignContractModal = ({ asset, isOpen, onClose, onSuccess }) => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      api
        .get("/api/contracts/")
        .then((res) => setContracts(res.data))
        .catch(() =>
          toast({
            title: "Error",
            description: "Failed to load contracts",
            status: "error",
            duration: 3000,
            isClosable: true,
          })
        );
    }
  }, [isOpen, toast]);

  const handleAssign = async () => {
    if (!selectedContract) {
      toast({
        title: "Warning",
        description: "Please select a contract",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/api/assets/${asset.id}/`, {
        amc_contract: selectedContract,
      });
      toast({
        title: "Success",
        description: "Contract assigned successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Assignment failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign AMC / CMC</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text>
              <strong>Asset:</strong> {asset?.asset_name} ({asset?.asset_id})
            </Text>
            <FormControl>
              <FormLabel>Select Contract</FormLabel>
              <Select
                placeholder="Select Contract"
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contract_type} | {contract.contract_number}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleAssign}
            isLoading={loading}
            loadingText="Assigning..."
          >
            Assign
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AssignContractModal;
