package pccit.finalproject.javaclient;

import pccit.finalproject.javaclient.view.AdminFrame;
import pccit.finalproject.javaclient.view.AdminController;

import javax.swing.SwingUtilities;

/**
 * Main entry point for Admin User Management Application
 */
public class Main {

    public static void main(String[] args) {
        // Ensure UI runs on Event Dispatch Thread
        SwingUtilities.invokeLater(() -> {
            try {
                // Create and show the main admin frame
                AdminFrame frame = new AdminFrame();
                
                // Create controller to handle interactions (the controller registers itself with the frame)
                new AdminController(frame);
                
                // Display the frame
                frame.setVisible(true);
            } catch (Exception e) {
                System.err.println("Error starting application: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }
}
