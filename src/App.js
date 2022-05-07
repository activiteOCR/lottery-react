import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import web3 from "./web3";
import lottery from "./lottery";

function App() {
  const [manager, setState] = useState("");
  const [players, setPlayers] = useState(0);
  //const [balance, setBalance] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [register, setRegister] = useState([]);
  const [prizePool, setPrizePool] = useState("");
  const [fee, setFee] = useState("");
  const [history, setHistory] = useState([]);

  const initConnection = async () => {
    const managers = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const prizePool = await lottery.methods.getPrizePool().call();
    const history = await lottery.methods.getWinnerByLottery(2).call();
    const fee = await lottery.methods.getFee().call();
    //const balance = await web3.eth.getBalance(lottery.options.address);
    setState(managers);
    setPlayers(players.length);
    //setBalance(balance);
    setRegister(players);
    setPrizePool(prizePool);
    setFee(fee);
    setHistory(history);
  };

  useEffect(() => {
    initConnection();
  }, []);

  useEffect(() => {
    lottery.events.Winner({}, (error, data) => {
      if (error) {
        console.log("error");
      } else {
        setMessage({ message: "We have a new winner!" });
        setWinner(data.returnValues[0]);
      }
    });
  }, [message]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    setMessage({ message: "Waiting on transaction success..." });

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(value.value, "ether"),
    });

    setMessage({ message: "You have been entered!" });
    const players = await lottery.methods.getPlayers().call();
    //const balance = await web3.eth.getBalance(lottery.options.address);
    setPlayers(players.length);
    //setBalance(balance);
    setRegister(players);
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>
        This contract is managed by {manager}. There are currently {players}
        {"/"}
        {(web3.utils.fromWei(prizePool, "ether") / 90) * 100000} people entered,
        competing to win {web3.utils.fromWei(prizePool, "ether")} ether!
      </p>

      <hr />
      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>
            Amount of ether to enter {web3.utils.fromWei(fee, "ether")}
          </label>
          <input onChange={(e) => setValue({ value: e.target.value })} />
        </div>
        <button>Enter</button>
      </form>
      <h1>{message.message}</h1>
      <h2>Previous Winner:</h2>
      <h3>{winner}</h3>

      <hr />
      <h2>Player in the game:</h2>
      <ol>
        {register.map((player) => (
          <li>{player}</li>
        ))}
      </ol>

      <hr />
      <h2>Lottery winner history:</h2>
      <h3>{history}</h3>
      <hr />
    </div>
  );
}
export default App;
