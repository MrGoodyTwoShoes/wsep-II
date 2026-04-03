THE JOURNEYSIS

Wanetopian Space Exploration Platform (WSEP)



Mission Document / README

Version 1.0 — March 2026


SUMMARY OF THE WANETOPIAN SPACE EXPLORER PROGRAM JOURNEYSIS

|FEATURE|STATUS|
|-|-|
|Satellite tracking|Confirmed|
|ISS pass prediction|Confirmed|
|3D globe visualization|Confirmed|
|African satellite highlighting|Confirmed|
|Satellite identification|Feasible|
|ISS radio windows|Confirmed (With Limitations)|
|Weather prediction|External data required|
|Black Ear alien detection|Educational simulation only|
|TLE Transmission Delay(s), Server Load Mgt, Smooth UX, Multiple Ext. Data Srcs, SAT ID (Lighting can affect data and info accuracy)|Miscellaneous Risks|

&#x09;

**1. Mission Statement**
The Wanetopian Space Exploration Platform (WSEP) is an Africa-focused space intelligence and visualization system designed to monitor satellite activity across the African sky in real time.


WSEP aims to make orbital information understandable, accessible, and visually engaging for users across the continent by combining public satellite data, lightweight web technologies, and immersive design.


The platform will function as an African Space Intelligence Dashboard, enabling users to observe satellites passing over Africa, analyze orbital patterns, and explore Africa’s growing role in space technology.


Guiding philosophy:
“Blue Is The New Black.”
This represents twilight—the moment satellites become visible—and symbolizes Africa stepping into the space age.

**2. Core Objectives**
WSEP is designed to:

Track satellites over Africa in near real time

Provide satellite pass predictions

Highlight African-owned/operated satellites

Visualize satellite constellations

Educate users on orbital mechanics


Focus: performance, accessibility, clarity

**3. System Overview**
**Frontend Interface**
Browser-based visualization system.

**Responsibilities:**

Render Earth + satellites

Display info panels

Provide interactivity

Optional spatial audio
**Tech stack:**

JavaScript

WebGL

Three.js

HTML/CSS
**Backend Processing Server**
Handles heavy computation.

**Responsibilities:**

Orbit propagation

Pass prediction

Filtering/classification

Data updates

API endpoints

**Tech stack:**

Python

FastAPI / Flask

SGP4

**Design principle:**

Heavy lifting stays server-side → smoother UX for low-end devices.

**4. Orbital Tracking Method**

Uses:

TLE (Two-Line Element) data

SGP4 propagation model

This allows calculation of satellite positions at any time.


Accuracy: \~1–3 km (depends on TLE freshness)

**5. Data Sources**
Primary:

**CelesTrak**

Plus:

Public space agency datasets

Mission records

**6 Core Features (v1)**

6.1 Real-Time Satellite Tracking

Live satellite movement

Africa-focused highlighting


**Displays:**

Name

Altitude

Velocity

Orbit path

**6.2 Satellite Pass Prediction**
Example:

Location: Nairobi

Satellite: ISS

Start: 19:42

Elevation: 68°

Direction: SW → NE

Duration: 7 min

Computed on backend → sent via API.


**6.3 Satellite Identification Tool**
Matches:
Location

Time

Altitude

Orbit path

Returns likely satellite.

**6.4 African Satellite Registry**
Database includes:
Mission name

Launch date

Orbit type

Objective

Status



Purpose: highlight Africa’s role in space.



**6.5 Constellation Visualization**



Show orbital shells

Display coverage networks

7\. Spatial Audio System



Optional immersion layer.



Examples:



Telemetry beeps

Radio tones

Ambient sound



User-controlled (on/off).



**8. Educational Modules (Future)**

Black Ear Radio Mode

Simulates radio astronomy

Shows:

Noise levels

Signal spikes

Interference



**⚠️ Educational only (not real alien detection)**



Weather Satellite Observation

Visual satellite weather data

No forecasting (yet)

Requires scaling + infrastructure

9\. Performance Design



Optimizations:



Server-side computation

Cached predictions

Region filtering

Limited rendering



**Goal: run on low-spec devices**



10\. Known Limitations

TLE data may be outdated

Visibility depends on lighting/weather

ISS comms require licensed equipment

Weather forecasting not built-in

11\. Mission Risks

Data accuracy maintenance

Server load scaling

Browser performance

External API integration



**Mitigation: incremental development.**



**12. Development Roadmap**

Environment setup

Orbit engine

Earth visualization

Satellite rendering

Pass prediction

African satellite DB

Audio + education



Each phase tested before progression.



**13. Long-Term Vision**

Potential expansion:



School tools

Telescope integration

Space debris tracking

Mission archives

Community observation network



Goal:

**Africa’s reference platform for space awareness**



**14. Closing Statement**



***WSEP merges open space data with accessible tech to create an African-centered space experience.***



It aims to:



Make space visible

Make it relatable

Make Africa part of the narrative



End of Document — **The Journeysis**

