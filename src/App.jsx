import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Swal from "sweetalert2";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  GiBroadsword,
  GiTemplarShield,
  GiCentaurHeart,
  GiSpeedometer,
} from "react-icons/gi";

const findPokemons = async (pagination) => {
  let finalList = [];
  let totalCount = 0;
  const initialList = await axios
    .get(`https://pokeapi.co/api/v2/pokemon/?limit=9&offset=${pagination}`)
    .then((res) => {
      totalCount = res.data.count;
      return res.data.results;
    });
  for (const pokemon of initialList) {
    await axios.get(pokemon.url).then((res) => finalList.push(res.data));
  }
  const data = {
    totalCount: totalCount,
    list: finalList,
  };
  return data;
};

const setDisableButton = (pages) => (pages === 0 ? true : false);

const InfoPages = ({ total, pages }) => {
  const totalPages = Math.floor(total / 9);
  const atualPage = pages / 9;

  return (
    <span>
      {atualPage + 1}/{totalPages}
    </span>
  );
};

const App = () => {
  const [pokeList, setPokeList] = useState([]);
  const [pagination, setPagination] = useState(0);
  const [findedResults, setFindedResults] = useState(0);
  const [individualData, setIndividualData] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const pokemonsData = await findPokemons(pagination);
      setPokeList(pokemonsData.list);
      setFindedResults(pokemonsData.totalCount);
    };
    fetchData();
  }, [pagination]);

  const openPokemonData = (data) => {
    setIndividualData(data);
    setVisibleModal(true);
  };

  const searchPokemons = async () => {
    if (searchValue !== "") {
      const value = searchValue.toLowerCase();
      await axios
        .get(`https://pokeapi.co/api/v2/pokemon/${value}`)
        .then((res) => openPokemonData(res.data))
        .catch(() =>
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Pokemon ${searchValue} not found`,
          })
        );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchPokemons();
    }
  };

  return (
    <>
      <h1>PokeDex 2.0</h1>
      <Header>
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search a Pokemon"
          onKeyDown={handleKeyDown}
        />
        <Button onClick={() => searchPokemons()}>Search</Button>
      </Header>
      <Grid>
        {pokeList.map((pokemon) => {
          const name = pokemon.name;
          const frontImage = pokemon.sprites.front_default;
          const backImage = pokemon.sprites.back_default;
          return (
            <Card key={pokemon.id} onClick={() => openPokemonData(pokemon)}>
              <h4>{name}</h4>
              <Images>
                <img id="FRONT_IMAGE" src={frontImage} />
                <img id="BACK_IMAGE" src={backImage} />
              </Images>
            </Card>
          );
        })}
      </Grid>
      <Footer>
        <Button
          disabled={setDisableButton(pagination)}
          onClick={() => setPagination(pagination - 9)}
        >
          <IoIosArrowBack />
        </Button>
        <InfoPages total={findedResults} pages={pagination} />
        <Button onClick={() => setPagination(pagination + 9)}>
          <IoIosArrowForward />
        </Button>
      </Footer>
      {visibleModal && (
        <Bakground>
          <Modal>
            <CloseIcon onClick={() => setVisibleModal(false)} />
            <h2>{individualData.name}</h2>
            <img src={individualData.sprites.front_default} />
            <img src={individualData.sprites.back_default} />
            {individualData.types.map((typeData) => (
              <div key={typeData.type.name}>{typeData.type.name}</div>
            ))}
            <div>{individualData.height / 10} M</div>
            <div>{individualData.weight / 10} Kg</div>
            <div>
              <GiBroadsword />
              {individualData.stats[1].base_stat}
            </div>
            <div>
              <GiTemplarShield />
              {individualData.stats[2].base_stat}
            </div>
            <div>
              <GiCentaurHeart />
              {individualData.stats[0].base_stat}
            </div>
            <div>
              <GiSpeedometer />
              {individualData.stats[5].base_stat}
            </div>
            {individualData.abilities.map((abilitieData) => (
              <div key={abilitieData.ability.name}>
                {abilitieData.ability.name}
              </div>
            ))}
          </Modal>
        </Bakground>
      )}
    </>
  );
};

const Header = styled.div`
  text-align: center;
`;

const Input = styled.input`
  height: 18px;
  margin-right: 10px;
`;

const Button = styled.button`
  height: 30px;
  cursor: pointer;

  :disabled {
    cursor: default;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  margin: 20px;
  gap: 10px;
`;

const Card = styled.div`
  text-align: center;
  border: 1px solid black;
  border-radius: 5px;
  cursor: pointer;

  h4 {
    text-transform: capitalize;
  }
`;

const Images = styled.span`
  #BACK_IMAGE {
    display: none;
  }

  :hover {
    #FRONT_IMAGE {
      display: none;
    }
    #BACK_IMAGE {
      display: inline;
    }
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;

const Bakground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 898;
  display: block;
`;

const Modal = styled.div`
  background-color: white;
  position: fixed;
  height: auto;
  max-height: 90vh;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
  border-radius: 5px;
  z-index: 899;
  text-align: center;
  padding: 10px;
  text-transform: capitalize;
  @media screen and (max-width: 400px) {
    max-width: 90vw;
  }
`;

const CloseIcon = styled(IoIosArrowBack)`
  display: flex;
  cursor: pointer;
`;

export default App;
