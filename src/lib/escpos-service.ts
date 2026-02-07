// src/lib/escpos-service.ts
// ESC/POS command service for thermal printer and cash drawer control

export class ESCPOSService {
  /**
   * Generate ESC/POS command to open cash drawer
   * Standard cash drawer open command: ESC p m t1 t2
   * ESC = 0x1B, p = 0x70, m = pin number (0 or 1), t1 = on time, t2 = off time
   */
  static generateCashDrawerOpenCommand(): Uint8Array {
    // ESC p 0 25 250 - Opens drawer connected to pin 0 for 25ms on, 250ms off
    return new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
  }

  /**
   * Alternative cash drawer command (some printers use different timing)
   */
  static generateCashDrawerOpenCommandAlt(): Uint8Array {
    // ESC p 0 60 120 - Alternative timing
    return new Uint8Array([0x1B, 0x70, 0x00, 0x3C, 0x78]);
  }

  /**
   * Generate ESC/POS command to cut paper (partial cut)
   */
  static generatePaperCutCommand(): Uint8Array {
    // GS V 1 - Partial cut
    return new Uint8Array([0x1D, 0x56, 0x01]);
  }

  /**
   * Generate ESC/POS command to cut paper (full cut)
   */
  static generatePaperFullCutCommand(): Uint8Array {
    // GS V 0 - Full cut
    return new Uint8Array([0x1D, 0x56, 0x00]);
  }

  /**
   * Send ESC/POS commands to printer via Web Serial API (modern browsers)
   */
  static async sendCommandsViaWebSerial(commands: Uint8Array[]): Promise<boolean> {
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        console.warn('Web Serial API not supported');
        return false;
      }

      // Request port access
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable.getWriter();

      // Send each command
      for (const command of commands) {
        await writer.write(command);
        // Small delay between commands
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await writer.close();
      await port.close();

      return true;
    } catch (error) {
      console.error('Failed to send ESC/POS commands via Web Serial:', error);
      return false;
    }
  }

  /**
   * Send ESC/POS commands via hidden iframe with data URL (fallback method)
   * This method attempts to send raw commands to the printer
   */
  static async sendCommandsViaDataURL(commands: Uint8Array[]): Promise<boolean> {
    try {
      // Convert commands to a string that can be printed
      const commandString = commands.map(cmd => 
        String.fromCharCode(...cmd)
      ).join('');

      // Create a hidden iframe with the command data
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return false;

      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                .commands { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="commands">${commandString}</div>
            <script>
              setTimeout(() => {
                window.print();
                parent.document.body.removeChild(parent.document.querySelector('iframe[src*="data:"]'));
              }, 100);
            </script>
          </body>
        </html>
      `);
      doc.close();

      return true;
    } catch (error) {
      console.error('Failed to send ESC/POS commands via data URL:', error);
      return false;
    }
  }

  /**
   * Main method to open cash drawer with multiple fallback methods
   */
  static async openCashDrawer(): Promise<boolean> {
    const commands = [
      this.generateCashDrawerOpenCommand(),
      // Add a small delay command if needed
    ];

    // Try Web Serial API first (most reliable for modern browsers)
    const webSerialSuccess = await this.sendCommandsViaWebSerial(commands);
    if (webSerialSuccess) {
      console.log('Cash drawer opened via Web Serial API');
      return true;
    }

    // Fallback to data URL method
    const dataURLSuccess = await this.sendCommandsViaDataURL(commands);
    if (dataURLSuccess) {
      console.log('Cash drawer command sent via data URL method');
      return true;
    }

    console.warn('Failed to open cash drawer - no supported method available');
    return false;
  }

  /**
   * Method to open cash drawer and cut paper simultaneously
   */
  static async openDrawerAndCutPaper(): Promise<boolean> {
    const commands = [
      this.generateCashDrawerOpenCommand(),
      this.generatePaperCutCommand(),
    ];

    const webSerialSuccess = await this.sendCommandsViaWebSerial(commands);
    if (webSerialSuccess) {
      console.log('Cash drawer opened and paper cut via Web Serial API');
      return true;
    }

    const dataURLSuccess = await this.sendCommandsViaDataURL(commands);
    if (dataURLSuccess) {
      console.log('Cash drawer and paper cut commands sent via data URL method');
      return true;
    }

    return false;
  }
}