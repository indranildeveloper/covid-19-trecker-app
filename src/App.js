import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  MenuItem,
  FormControl,
  Select,
} from "@material-ui/core";
import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import LineGraph from "./components/LineGraph";
import { prettyPrintStat, sortData } from "./util";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch(`https://disease.sh/v3/covid-19/all`)
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url =
      countryCode === "worldwide"
        ? `https://disease.sh/v3/covid-19/all`
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        countryCode === "worldwide"
          ? setMapCenter([20.5937, 78.9629])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(5);
        // console.log([data.countryInfo.lat, data.countryInfo.long]);
      });
  };

  // console.log(countryInfo);

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide" key={Math.random()}>
                Worldwide
              </MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value} key={Math.random()}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            title="COVID-19 Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases}
            onClick={(e) => setCasesType("cases")}
            active={casesType === "cases"}
          />
          <InfoBox
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered}
            onClick={(e) => setCasesType("recovered")}
            active={casesType === "recovered"}
          />
          <InfoBox
            isRed
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths}
            onClick={(e) => setCasesType("deaths")}
            active={casesType === "deaths"}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide Live {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
