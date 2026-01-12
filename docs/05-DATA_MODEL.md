classDiagram
    %% Core Management
    class SceneManager {
        +init()
        +setQuality(tier)
        +animate()
        -camera: Camera
        -renderer: WebGLRenderer
    }

    %% Data Entities
    class CelestialBody {
        +String id
        +String name
        +Vector3 position
        +LODLevel currentLOD
        +updatePosition(EphemerisData)
        +focus()
    }

    class Planet {
        +Boolean hasRings
        +List~Moon~ moons
        +TextureSet textures
    }

    class Moon {
        +Planet parent
        +Float orbitRadius
    }

    %% Fallback & Support
    class FallbackSystem {
        +getStaticData()
        +validateHealth()
    }

    class API_Contract {
        +getEphemeris(date)
    }

    SceneManager *-- "many" CelestialBody : renderiza
    CelestialBody <|-- Planet : herda
    CelestialBody <|-- Moon : herda
    Planet "1" *-- "0..1" Moon : possui (Apenas Terra no MVP)
    SceneManager ..> API_Contract : consome
    API_Contract ..> FallbackSystem : usa se falhar