-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS DevAtHomeDB;
USE DevAtHomeDB;

-- Create enum table for user roles (since MySQL doesn't support enums directly like Prisma)
CREATE TABLE IF NOT EXISTS Role (
    id INT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert default roles
INSERT INTO Role (id, name) VALUES (1, 'USER'), (2, 'ADMIN');

-- Create User table
CREATE TABLE IF NOT EXISTS User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    dateOfBirth DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role INT DEFAULT 1,
    username VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT,
    profileImage TEXT,
    FOREIGN KEY (role) REFERENCES Role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Photo table
CREATE TABLE IF NOT EXISTS Photo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url TEXT NOT NULL,
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    likes INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Comment table
CREATE TABLE IF NOT EXISTS Comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    userId INT NOT NULL,
    photoId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (photoId) REFERENCES Photo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Like table
CREATE TABLE IF NOT EXISTS `Like` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    photoId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (photoId) REFERENCES Photo(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (userId, photoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Film Development Tables

-- Fomapan 400 tables
CREATE TABLE IF NOT EXISTS fomapan400hc110 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fomapan400ilfosol3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fomapan400ilfoteclc29 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fomapan400rodinal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fomapan400tmaxdev (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm VARCHAR(10),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- HP5 tables
CREATE TABLE IF NOT EXISTS hp5hc110 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hp5ilfosol3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hp5ilfoteclc29 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hp5rodinal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hp5tmaxdev (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TMAX 400 tables
CREATE TABLE IF NOT EXISTS tmax400hc110 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm VARCHAR(10),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tmax400ilfosol3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tmax400rodinal (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tmax400tmaxdev (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tmax400ilfoteclc29 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(50),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temp VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RPX 400 tables
CREATE TABLE IF NOT EXISTS rpx400hc110 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(100),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temperature VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpx400ilfosol3 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(100),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temperature VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpx400ilfoteclc29 (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(100),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temperature VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rpx400tmaxdev (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film VARCHAR(100),
    developer VARCHAR(50),
    dilution VARCHAR(10),
    asa_iso INT,
    time_35mm DECIMAL(5,2),
    temperature VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 