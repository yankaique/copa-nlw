import { Center, Icon, Text } from "native-base";
import { Fontisto } from "@expo/vector-icons";

import { useAuth } from "../hooks/useAuth";
import LogoCopaNLW from "../assets/logo.svg";
import { Button } from "../components/Button";

export function SignIn() {
  const { signIn, isUserLoading } = useAuth();

  return (
    <Center flex={1} bgColor="gray.900" p={7}>
      <LogoCopaNLW width={212} height={40} />
      <Button
        leftIcon={<Icon as={Fontisto} name="google" color="white" size="md" />}
        title="Entrar com o Google"
        type="SECONDARY"
        mt={12}
        onPress={signIn}
        isLoading={isUserLoading}
        _loading={{ _spinner: { color: "white" } }}
      />
      <Text color="white" textAlign="center" mt={4}>
        Não utilizamos nenhuma informação além{"\n"} do seu e-mail para criação
        de sua conta.
      </Text>
    </Center>
  );
}
