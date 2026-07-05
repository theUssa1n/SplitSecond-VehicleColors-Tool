# VehCol-Tool - Split/Second Vehicle Colors Editor

A modern, offline-first tool for customizing `VehicleColors.params` file for the game Split/Second.

## Features

- **Offline Mode**: All assets (fonts, icons) are bundled locally
- **Full Palette Editing**: RGB (Paint, Lacquer, Flake) color customization
- **Smart Randomizer**: Generate harmonious color schemes
- **Color Library**: Save and reuse your favorite palettes
- **Full Vehicle Copy/Paste**: Transfer all palettes between vehicles
- **Slot Copy/Paste**: Transfer individual Paint/Lacquer/Flake entries
- **Advanced Color Picker**: Modern picker with SV square, Hue bar, and RGB/HEX inputs
- **Sync Feature**: Fix DLC vehicle color rendering bugs
- **Update Checker**: Automatic version checking
- **Light/Dark Theme**: Glassmorphism UI with theme toggle
- **Drag-and-Drop**: Quick file upload

## Usage

### SSDC Version (Recommended)

1. Locate your game's `VehicleColors.params` file:
   - File Location: `[Main Game Folder]\Deferred\Vehicles`

2. **Important**: First-time setup
   - Use the fixed `vehiclecolors.params` from the `fixed-vehiclecolors_for-ssdc` folder
   - Replace your original game file with this fixed version to prevent DLC vehicle conflicts

3. Open `VehCol-Tool.html` in your browser
4. Upload your `VehicleColors.params` file
5. Customize colors as desired
6. Save and replace the game file

### Steam Version

Currently not directly supported. The Steam version uses packed `.ark` archives. It's strongly recommended to use the SSDC version for full modding support.

## License

This project is for educational and modding purposes.

## Changelog

See [Changelog.txt](Changelog.txt) for detailed version history.

