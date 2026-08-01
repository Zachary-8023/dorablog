package pccit.finalproject.javaclient.view;

import pccit.finalproject.javaclient.pojos.User;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.net.URL;

/**
 * Panel to display selected user profile with avatar
 * Handles asynchronous image loading
 */
public class UserProfilePanel extends JPanel {
    private JLabel avatarLabel;
    private JLabel usernameLabel;
    private JLabel realnameLabel;
    private JLabel adminLabel;
    private JLabel descriptionLabel;
    private JProgressBar loadingBar;

    public UserProfilePanel() {
        initializeComponents();
        layoutComponents();
    }

    private void initializeComponents() {
        avatarLabel = new JLabel("Select a user");
        avatarLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        usernameLabel = new JLabel("");
        realnameLabel = new JLabel("");
        adminLabel = new JLabel("");
        descriptionLabel = new JLabel("");
        descriptionLabel.setVerticalAlignment(SwingConstants.TOP);
        descriptionLabel.setMaximumSize(new Dimension(300, Integer.MAX_VALUE));
        
        loadingBar = new JProgressBar();
        loadingBar.setIndeterminate(true);
        loadingBar.setVisible(false);
    }

    private void layoutComponents() {
        setLayout(new BorderLayout(10, 10));
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(new BoxLayout(infoPanel, BoxLayout.Y_AXIS));
        
        infoPanel.add(avatarLabel);
        infoPanel.add(Box.createVerticalStrut(10));
        
        infoPanel.add(usernameLabel);
        infoPanel.add(Box.createVerticalStrut(5));
        
        infoPanel.add(realnameLabel);
        infoPanel.add(Box.createVerticalStrut(5));
        
        infoPanel.add(adminLabel);
        infoPanel.add(Box.createVerticalStrut(10));
        
        infoPanel.add(descriptionLabel);
        infoPanel.add(Box.createVerticalStrut(10));
        
        infoPanel.add(loadingBar);
        
        add(infoPanel, BorderLayout.CENTER);
    }

    public void displayUser(User user) {
        if (user == null) {
            avatarLabel.setText("Select a user");
            avatarLabel.setIcon(null);
            usernameLabel.setText("");
            realnameLabel.setText("");
            adminLabel.setText("");
            descriptionLabel.setText("");
            return;
        }

        usernameLabel.setText("Username: " + user.getUsername());
        realnameLabel.setText("Name: " + user.getRealname());
        adminLabel.setText("Admin: " + (user.isAdmin() ? "Yes" : "No"));
        descriptionLabel.setText("Description: " + 
            (user.getDescription() != null ? user.getDescription() : "N/A"));
        
        // Avatar will be loaded asynchronously
        avatarLabel.setText("Loading...");
        avatarLabel.setIcon(null);
        loadingBar.setVisible(true);
    }

    public void displayAvatar(URL url) {
        loadingBar.setVisible(false);
        if (url != null) {
            // Scale avatar to a fixed size
            final int targetWidth = 150;
            final int targetHeight = 150;
            ImageIcon originalIcon = new ImageIcon(url);
            Image scaled = originalIcon.getImage().getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
            avatarLabel.setPreferredSize(new Dimension(targetWidth, targetHeight));
            avatarLabel.setIcon(new ImageIcon(scaled));
            avatarLabel.setText("");
        } else {
            avatarLabel.setText("No avatar");
        }
    }
}

