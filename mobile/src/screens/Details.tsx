import { useState, useEffect } from "react";
import { Share } from 'react-native';
import { VStack, useToast, HStack } from "native-base";

import { useRoute } from '@react-navigation/native';
import { Header } from "../components/Header";
import { Guesses } from "../components/Guesses";
import { Loading } from "../components/Loading";
import { api } from "../services/api";
import { PoolCard, PoolCardProps } from "../components/PoolCard";
import { Option } from '../components/Option';
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";

interface RouteParams {
    id: string;
}

export function Details() {
    const route = useRoute();
    const { id } = route.params as RouteParams;
    const toast = useToast();

    const [optionSelected, setOptionSelected] = useState<'Seus palpites' | 'Ranking do grupo'>('Seus palpites');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pollDetails, setPollDetails] = useState<PoolCardProps>({} as PoolCardProps);

    async function fetchPoolDetails() {
        try {
            setIsLoading(true);
            const response = await api.get(`pools/${id}`);
            setPollDetails(response.data.poll);
        } catch (error) {
            toast.show({
                title: "Não foi possível carregar os detalhes do bolão!",
                placement: "top",
                bgColor: "red.500",
            });

        } finally {
            setIsLoading(false);
        }
    }

    async function handleCodeShare() {
        await Share.share({
            message: pollDetails.code
        })
    }

    useEffect(() => {
        fetchPoolDetails();
    }, [id])

    return (
        <>
            {isLoading ?
                <Loading />
                :
                <VStack flex={1} bgColor="gray.900">
                    <Header
                        title={pollDetails.title}
                        showBackButton
                        showShareButton
                        onShare={handleCodeShare}
                    />
                    {pollDetails._count?.participants > 0 ?
                        <VStack>
                            <PoolCard data={pollDetails} />
                            <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
                                <Option title="Seus palpites"
                                    isSelected={optionSelected === 'Seus palpites'}
                                    onPress={() => setOptionSelected('Seus palpites')}
                                />
                                <Option
                                    title="Ranking do grupo"
                                    isSelected={optionSelected === 'Ranking do grupo'}
                                    onPress={() => setOptionSelected('Ranking do grupo')}

                                />
                            </HStack>
                            <Guesses poolId={pollDetails.id} code={pollDetails.code} />
                        </VStack>
                        :
                        <EmptyMyPoolList code={pollDetails.code} />
                    }
                </VStack>
            }
        </>
    );

}