/src
  /app              # Expo Router pages (Home, Game, Shop)
  /assets           # 3D Models (.glb), Textures (.png), Sounds (.mp3)
  /components       # Shared UI Components (Buttons, Cards - "Atomic Design")
  /features         # Game Modules
    /game           # Core Game Loop (Canvas, Lights, Camera)
    /player         # Player logic, controls, model
    /track          # Infinite scroll logic, Spawners
    /enemies        # Obstacle logic (Haddad, Trump, Lula)
  /stores           # Zustand Stores (useGameStore.ts)
  /theme            # Colors, Fonts, Tailwind Config
  /utils            # Helpers (Randomizers, Math)