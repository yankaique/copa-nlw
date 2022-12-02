import { useState, useEffect } from 'react';
import { Box, useToast, FlatList } from 'native-base';
import { api } from '../services/api';
import { Game, GameProps } from './Game';
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTemPoints, setFirstTemPoints] = useState<string>("0");
  const [secondTemPoints, setSecondTemPoints] = useState<string>("0");

  async function fetchGames() {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/pools/${poolId}/games`);
      setGames(data.games);
    } catch (error) {
      toast.show({
        title: "Não foi possível carregar os jogos!",
        placement: "top",
        bgColor: "red.500",
      });

    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuessesConfirm(gameId: string) {
    try {
      if (!firstTemPoints.trim() || !secondTemPoints.trim()) {
        return toast.show({
          title: "Informe o placar do palpite",
          placement: "top",
          bgColor: "red.500",
        });
      }

      await api.post(`pools/${poolId}/games/${gameId}/guesses`, {
        firstTemPoints: Number(firstTemPoints),
        secondTemPoints: Number(secondTemPoints)
      });

      toast.show({
        title: "Palpite enviado com sucesso!",
        placement: "top",
        bgColor: "green.500",
      });

      fetchGames();
    } catch (error) {
      toast.show({
        title: "Erro ao enviar o palpite",
        placement: "top",
        bgColor: "red.500",
      });

    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [poolId]);

  if (isLoading) {
    return <Loading />
  };

  return (
    <Box>
      <FlatList
        data={games}
        keyExtractor={item => item.id}

        renderItem={({ item }) => (
          <Game
            data={item}
            setFirstTeamPoints={setFirstTemPoints}
            setSecondTeamPoints={setSecondTemPoints}
            onGuessConfirm={() => handleGuessesConfirm(item.id)}
          />)
        }
        ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
      />
    </Box>
  );
}
