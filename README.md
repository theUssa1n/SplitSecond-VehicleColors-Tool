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
- **Add Slot**: Append brand-new color palettes beyond the stock count (e.g. 9)
- **Remove Palette**: Delete any palette entirely (removed from the saved file)
- **5-Column Grid**: Center-aligned, denser palette grid

## Usage

### Prerequisites

- You **must** have the **SplitSecondDC (SSDC)** version of the game
- Join the official community Discord server to get SSDC: [https://discord.gg/GgYQFMM8FH](https://discord.gg/GgYQFMM8FH)

### How to Use

1. Download and extract the latest release (`SS_VCT.zip`)
2. Open `VehCol-Tool.html` in your browser
3. Locate your game's `VehicleColors.params` file:
   - File Location: `[Main Game Folder]\Deferred\Vehicles`
4. **Important**: First-time setup
   - Use the fixed `vehiclecolors.params` from the `fixed-vehiclecolors_for-ssdc` folder
   - Replace your original game file with this fixed version to prevent DLC vehicle conflicts
5. Upload your `VehicleColors.params` file to the tool
6. Customize colors as desired
7. Save the file and replace the original in your game folder

### Steam Version

Currently not directly supported. The Steam version uses packed `.ark` archives. It's strongly recommended to use the SSDC version for full modding support.

## License

This project is for educational and modding purposes.

## Changelog

See [Changelog.txt](Changelog.txt) for detailed version history.
