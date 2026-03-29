# CrowdSense Mumbai Dataset Inventory

This document lists all datasets and data sources required to build, train, and validate the CrowdSense Mumbai AI model.

## 1. Model Training Datasets
| Dataset Name | Type | Source | Description |
| :--- | :--- | :--- | :--- |
| **Mumbai Crowd Synthetic Dataset** | CSV | Internal | 2,500 rows generated based on real Mumbai behavioral patterns (peak hours, monsoon, festivals). |
| **BEST Bus Stops & Depots** | KML/CSV | OpenCity.in | Spatial data for all bus stops in Mumbai; used to map transit hotspots. |
| **Mumbai Suburban Rail Network** | KML | OpenCity.in | Geographic data for Central, Western, and Harbour lines and stations. |
| **Comprehensive Mobility Plan (CMP)** | PDF/Data | MMRDA/MCGM | Baseline data for modal splits, hourly traffic volumes, and ridership benchmarks. |
| **Mumbai Traffic Violations** | CSV | OpenCity.in | Historical data on congestion-related incidents; can be used as a proxy for bottleneck prediction. |

## 2. Advanced Signal APIs (Performance Boosters)
| API Source | Purpose | enhancement |
| :--- | :--- | :--- |
| **OpenWeather API** | Weather Signal | Basis for rain/storm impact on outdoor crowding. |
| **Google Maps Routes API** | Traffic Signal | Live travel duration and delays compared to baseline. |
| **WorldTides / Marea API** | **[NEW]** Tide Levels | Predicts beach accessibility (Juhu, Marine Drive) and potential monsoon flooding impact. |
| **PredictHQ API** | **[NEW]** Event Signal | Tracks large-scale festivals, concerts, and public gatherings that drive crowd spikes. |
| **X (Twitter) API** | **[NEW]** Sentiment/Alerts | Real-time crowd reports from handles like `@RailMumbai` or `#MumbaiTraffic`. |
| **AirVisual (IQAir) API** | **[NEW]** Air Quality | Indirect signal for beach/outdoor footfall (low AQI = fewer people in public spaces). |

## 3. Contextual & Static Metadata
| Dataset Name | Description | Key Contents |
| :--- | :--- | :--- |
| **Mumbai Location Registry** | 20+ key locations across Mumbai with categorical labels. | Andheri, Dadar, CSMT, BKC, etc. |
| **Mumbai Peak Hour Schedule** | Mapping of morning/evening peaks by location type. | Office Zones (9-11 AM, 6-8 PM), Markets (5-9 PM). |
| **2025 Festival Calendar** | Public holidays and major event dates in Mumbai. | Ganesh Chaturthi (Aug 27), Diwali (Oct 21), etc. |
| **Signal Weights** | Impact of each signal on crowd levels per location type. | Weather impact is higher for Beaches; Hour impact is higher for Stations. |

## 4. Validation & Reference Data
| Source | Purpose | Data Links / Type |
| :--- | :--- | :--- |
| **MRVC / Zonal Railways** | Annual Trends | [SG-1 Category Stats](https://indianrailways.gov.in) |
| **OpenCity.in Portal** | Urban Data | [data.opencity.in/mumbai](https://data.opencity.in) |
| **MMMOCL / MMRC** | Metro Milestones | Ridership press releases for Lines 2A, 7, and 3. |
| **TomTom Mumbai Index** | Traffic Baseline | Historical congestion benchmarks by hour/day. |

## Detailed Location List (Target 20)
Based on research, these high-footfall areas are priority for the model:
- **Stations (Interchanges):** Thane, Dadar, CSMT, Andheri, Kurla, Churchgate.
- **Business Hubs:** BKC, Nariman Point, Lower Parel, Worli, Andheri East.
- **Markets:** Colaba Causeway, Crawford Market, Linking Road, Zaveri Bazaar.
- **Beaches/Public:** Juhu Beach, Marine Drive, Girgaum Chowpatty.
- **Religious:** Siddhivinayak Temple, Mahalaxmi Temple, Haji Ali Dargah.
