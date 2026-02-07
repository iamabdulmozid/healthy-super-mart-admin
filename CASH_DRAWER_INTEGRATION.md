# Cash Drawer Integration Setup Guide

## Overview
This guide explains how to set up automatic cash drawer opening for your MUNBYN thermal printer and Washin cash drawer in the POS system.

## Hardware Requirements
- **Printer**: MUNBYN Thermal Printer (Model: ITPP047USEB) with ESC/POS support
- **Cash Drawer**: Washin WS-330 Compact Cash Drawer
- **Connection**: RJ12 (6P6C) cable connecting cash drawer to printer

## Software Implementation

### 1. ESC/POS Service (`src/lib/escpos-service.ts`)
This service handles sending ESC/POS commands to the printer for cash drawer control:

**Key Features:**
- Standard ESC/POS cash drawer commands
- Web Serial API support for modern browsers
- Fallback methods for different browser environments
- Paper cutting commands (bonus feature)

**Commands Used:**
- Cash Drawer Open: `ESC p 0 25 250` (0x1B, 0x70, 0x00, 0x19, 0xFA)
- Alternative timing: `ESC p 0 60 120` (0x1B, 0x70, 0x00, 0x3C, 0x78)

### 2. Receipt Generator Updates (`src/modules/pos/components/ReceiptGenerator.tsx`)
Enhanced the receipt printing component with:
- Automatic cash drawer opening after printing (cash payments only)
- Manual cash drawer open button
- Error handling and user notifications

### 3. Printer Settings Component (`src/modules/pos/components/PrinterSettings.tsx`)
Provides a user-friendly interface for:
- Setup instructions
- Browser compatibility testing
- Cash drawer testing
- Troubleshooting guide

## Browser Compatibility

### Supported Browsers
- **Chrome** (recommended)
- **Microsoft Edge**
- **Opera**

### Web Serial API
The cash drawer functionality uses the Web Serial API for direct communication with the printer. This provides the most reliable method for sending ESC/POS commands.

## Setup Instructions

### 1. Physical Setup
1. Connect the cash drawer to the printer using the RJ12 cable
2. Connect the printer to your computer via USB
3. Ensure both devices are powered on

### 2. Printer Configuration
1. Set the printer to ESC/POS mode (check printer manual)
2. Enable cash drawer functionality in printer settings
3. Verify baud rate is set to 9600 (standard for thermal printers)

### 3. Browser Setup
1. Use a supported browser (Chrome, Edge, or Opera)
2. Ensure Web Serial API is enabled (usually default)
3. Grant permission when prompted to access the printer

### 4. Testing
1. Navigate to the POS page
2. Click the settings gear icon (⚙️) in the top-right
3. Use the "Test Browser Support" button to verify Web Serial API
4. Use the "Test Cash Drawer" button to test the drawer opening

## Usage

### Automatic Opening
- Cash drawer will automatically open after printing receipts for cash payments
- Card payments will not trigger the drawer (as expected)

### Manual Opening
- Use the money emoji button (💰) next to the print button for manual control
- Available in both the main interface and the receipt preview modal

## Troubleshooting

### Cash Drawer Not Opening
1. **Check Physical Connections**
   - Verify RJ12 cable is securely connected
   - Ensure printer is connected via USB and powered on

2. **Printer Settings**
   - Confirm printer is in ESC/POS mode
   - Check if cash drawer is enabled in printer configuration
   - Some printers have pin configuration settings (pin 0 vs pin 1)

3. **Browser Issues**
   - Try a different supported browser
   - Clear browser cache and cookies
   - Check if Web Serial API permissions were denied

4. **Alternative Commands**
   - The service includes alternative timing commands
   - Some printers may require different pin configurations

### Error Messages
- Permission denied: Grant Web Serial API access in browser
- Device not found: Check USB connection and printer power
- Command failed: Try the alternative timing commands or check printer manual

## Technical Details

### ESC/POS Commands
```javascript
// Standard cash drawer open command
const command = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
// ESC p 0 25 250 (pin 0, 25ms on, 250ms off)
```

### Web Serial API Usage
```javascript
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 9600 });
const writer = port.writable.getWriter();
await writer.write(command);
```

## Future Enhancements

1. **Configurable Timing**: Allow users to adjust timing parameters
2. **Pin Selection**: Support for different pin configurations
3. **Multiple Drawer Support**: Handle multiple cash drawers
4. **Network Printing**: Support for network-connected printers
5. **Receipt Customization**: More thermal receipt formatting options

## Security Considerations

- Web Serial API requires HTTPS in production
- User permission is required for each session
- Commands are sent directly to hardware (no server involvement)

## Support

If you experience issues:
1. Check the troubleshooting section above
2. Consult your printer manual for ESC/POS configuration
3. Verify hardware connections
4. Test with different browsers

The implementation provides multiple fallback methods and comprehensive error handling to ensure the best possible compatibility with your hardware setup.