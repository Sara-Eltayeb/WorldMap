import { Router } from "express";
import { getMCPClient } from "../mcpClient.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const client = await getMCPClient();
    const countries = await client.getCountries();
    res.json({ success: true, data: countries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/info", async (req, res) => {
  try {
    const { country } = req.body;
    if (!country) {
      return res
        .status(400)
        .json({ success: false, error: "Country name is required" });
    }
    const client = await getMCPClient();
    const info = await client.getCountryInfo(country);
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/compare", async (req, res) => {
  try {
    const { country1, country2 } = req.body;
    if (!country1 || !country2) {
      return res
        .status(400)
        .json({ success: false, error: "Two country names are required" });
    }
    const client = await getMCPClient();
    const [info1, info2] = await Promise.all([
      client.getCountryInfo(country1),
      client.getCountryInfo(country2),
    ]);
    res.json({ success: true, data: { country1: info1, country2: info2 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/weather", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res
        .status(400)
        .json({ success: false, error: "City name is required" });
    }
    const client = await getMCPClient();
    const weather = await client.getWeather(city);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/forecast", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res
        .status(400)
        .json({ success: false, error: "City name is required" });
    }
    const client = await getMCPClient();
    const forecast = await client.getForecast(city);
    res.json({ success: true, data: forecast });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/convert", async (req, res) => {
  try {
    const { from, to, amount = 1 } = req.body;
    if (!from || !to) {
      return res
        .status(400)
        .json({ success: false, error: "Source and target currencies are required" });
    }
    const client = await getMCPClient();
    const result = await client.convertCurrency(from, to, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
