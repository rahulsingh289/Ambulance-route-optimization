-- Hospital & Location Management Module
-- Database Schema

CREATE DATABASE IF NOT EXISTS ambulance_system;
USE ambulance_system;

CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact VARCHAR(20),
    specialization VARCHAR(255),
    available_beds INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    region VARCHAR(100),
    is_remote BOOLEAN DEFAULT FALSE
);

-- Sample data
INSERT INTO hospitals (name, address, latitude, longitude, contact, specialization, available_beds) VALUES
('City General Hospital', '12 Main Road, District A', 30.3165, 78.0322, '01234567890', 'General', 20),
('Rural Health Center', 'Village Road, Remote Area B', 30.1234, 77.9876, '09876543210', 'Emergency', 5),
('Mountain Care Hospital', 'Hill Station, Region C', 30.5678, 78.1234, '01122334455', 'Trauma', 10),
('Valley Medical Center', 'Valley Road, District D', 30.2456, 77.8765, '01234509876', 'General', 15),
('Remote Aid Hospital', 'Forest Area, Region E', 30.6789, 78.3456, '09988776655', 'Emergency', 3);

INSERT INTO locations (name, latitude, longitude, region, is_remote) VALUES
('District A Center', 30.3165, 78.0322, 'District A', FALSE),
('Remote Village B', 30.1234, 77.9876, 'Remote Area B', TRUE),
('Hill Station C', 30.5678, 78.1234, 'Region C', TRUE),
('Valley Town D', 30.2456, 77.8765, 'District D', FALSE),
('Forest Area E', 30.6789, 78.3456, 'Region E', TRUE),
('Urban Zone F', 30.3500, 78.0500, 'District F', FALSE);
