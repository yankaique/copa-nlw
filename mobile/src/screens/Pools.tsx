import { useState, useCallback } from "react";
import { Icon, useToast, VStack, FlatList } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

import { Octicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { PoolCard, PoolCardProps } from "../components/PoolCard";

import { api } from "../services/api";
import { EmptyPoolList } from "../components/EmptyPoolList";

export function Pools() {
  const { navigate } = useNavigation();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [polls, setPolls] = useState<PoolCardProps[]>([]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const { data } = await api.get("pools");
      setPolls(data.polls);
    } catch (error) {
      toast.show({
        title: "Não foi possível carregar os botões",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Meus bolões" />
      <VStack
        mt={6}
        mx={5}
        borderBottomWidth={1}
        borderBottomColor="gray.600"
        pb={4}
        mb={4}
      >
        <Button
          leftIcon={
            <Icon as={Octicons} name="search" color="black" size="md" />
          }
          title="BUSCAR BOLÃO POR CÓDIGO"
          onPress={() => navigate("find")}
        />
      </VStack>
      {isLoading ?
        <Loading />
        :

        <FlatList
          data={polls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoolCard data={item}
              onPress={() => navigate('details', {
                id: item.id
              })}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <EmptyPoolList />}
          _contentContainerStyle={{ pb: 10 }}
          px={5}
        />
      }
    </VStack>
  );
}
