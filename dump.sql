-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: ims_db0.3.0
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `brand_id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (1,'Republic Cement','Leading cement manufacturer in the Philippines'),(2,'Holcim','Global construction materials company'),(3,'Davis Paint','Premium paint and coatings brand'),(4,'Boysen','Top paint brand in the Philippines'),(5,'Union Galvasteel','Steel and roofing solutions provider'),(6,'Purelife','Plumbing and water solutions'),(7,'Meiji','Electrical wires and cables'),(8,'Armstrong','Ceiling and insulation products ');
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Cement'),(2,'Wood'),(3,'Steel'),(4,'Paint'),(5,'Plumbing'),(6,'Electrical'),(7,'Roofing'),(8,'Tiles'),(9,'Insulation'),(10,'Sand');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_credentials`
--

DROP TABLE IF EXISTS `login_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_credentials` (
  `login_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`login_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_credentials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_credentials`
--

LOCK TABLES `login_credentials` WRITE;
/*!40000 ALTER TABLE `login_credentials` DISABLE KEYS */;
INSERT INTO `login_credentials` VALUES (1,1,'admin','admin'),(2,2,'12345678','Juan Dela Cruz'),(3,3,'1','1');
/*!40000 ALTER TABLE `login_credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `product_name` varchar(50) DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`brand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Portland Cement Type 1',1),(2,1,'Portland Cement Type 2',2),(3,1,'Masonry Cement',1),(4,2,'Coco Lumber',NULL),(5,2,'Mahogany Plywood',NULL),(6,2,'Marine Plywood',NULL),(7,3,'GI Sheet Corrugated',5),(8,3,'Angle Bar',5),(9,3,'Flat Bar',5),(10,4,'Boysen Latex Paint White',4),(11,4,'Davis Latex Paint White',3),(12,4,'Boysen Primer',4),(13,5,'PVC Pipe 1/2',6),(14,5,'PVC Pipe 3/4',6),(15,5,'Gate Valve 1/2',6),(16,6,'Thhn Wire 12',7),(17,6,'Thhn Wire 14',7),(18,6,'Duplex Wire 14',7),(19,7,'Pre-Painted Roofing Sheet',5),(20,7,'Ridge Roll',5),(21,8,'Ceramic Floor Tile 12x12',NULL),(22,8,'Ceramic Wall Tile 8x12',NULL),(23,8,'Granite Tile 24x24',NULL),(24,9,'Fiberglass Insulation',8),(25,9,'Foam Insulation Board',8),(26,10,'Washed Sand',NULL),(27,10,'River Sand',NULL),(28,1,'CHB 4 inch',NULL),(29,3,'Deformed Bar 10mm',5),(30,3,'Deformed Bar 12mm',5);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipt`
--

DROP TABLE IF EXISTS `receipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipt` (
  `receipt_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) DEFAULT NULL,
  `contact_num` varchar(11) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `payment_method` enum('gcash','cash') DEFAULT NULL,
  `amount_tendered` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`receipt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipt`
--

LOCK TABLES `receipt` WRITE;
/*!40000 ALTER TABLE `receipt` DISABLE KEYS */;
INSERT INTO `receipt` VALUES (1,'Marc Daniel Lapid','09000000000','Santa Lucia Matua','2026-04-26','14:50:07','cash',500.00),(2,'Juan Dela Cruz','09000000000','Santa Lucia Matua, Masantol, Pampanga','2026-04-26','14:58:38','cash',400.00),(3,'Juan Dela Cruz','09000000000','Santa Cruz, Manila, Metro Manila','2026-04-26','15:00:11','cash',12000.00),(4,'Juan Dela Cruz','09000000000','Santo Domingo, Manila, Metro Manila','2026-04-26','15:06:33','cash',12000.00),(5,'Juan Dela Cruz','09000000000','Makati City, 1250 Metro Manila','2026-04-26','15:13:25','cash',13000.00);
/*!40000 ALTER TABLE `receipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_logs`
--

DROP TABLE IF EXISTS `report_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_logs` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `activity` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `user_id` (`user_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `report_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`user_id`),
  CONSTRAINT `report_logs_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_logs`
--

LOCK TABLES `report_logs` WRITE;
/*!40000 ALTER TABLE `report_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_type` enum('admin','staff') DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'admin'),(2,'staff');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_info`
--

DROP TABLE IF EXISTS `supplier_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_info` (
  `sup_info_id` int NOT NULL AUTO_INCREMENT,
  `contact_num` varchar(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  PRIMARY KEY (`sup_info_id`),
  UNIQUE KEY `contact_num` (`contact_num`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_info`
--

LOCK TABLES `supplier_info` WRITE;
/*!40000 ALTER TABLE `supplier_info` DISABLE KEYS */;
INSERT INTO `supplier_info` VALUES (1,'09171234567','santos@mail.com','Quezon City','Santos Construction Supply','active'),(2,'09281234567','reyes@mail.com','Manila','Reyes Hardware','active'),(3,'09391234567','cruz@mail.com','Caloocan','Cruz Building Materials','active');
/*!40000 ALTER TABLE `supplier_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_items`
--

DROP TABLE IF EXISTS `supplier_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_items` (
  `sup_items_id` int NOT NULL AUTO_INCREMENT,
  `sup_info_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`sup_items_id`),
  KEY `sup_info_id` (`sup_info_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `supplier_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `supplier_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_items`
--

LOCK TABLES `supplier_items` WRITE;
/*!40000 ALTER TABLE `supplier_items` DISABLE KEYS */;
INSERT INTO `supplier_items` VALUES (1,1,1),(2,1,2),(3,1,3),(4,1,28),(5,2,4),(6,2,5),(7,2,6),(8,2,21),(9,2,22),(10,2,23),(11,3,7),(12,3,8),(13,3,9),(14,3,19),(15,3,20),(16,3,29),(17,3,30),(18,1,10),(19,1,11),(20,1,12),(21,2,13),(22,2,14),(23,2,15),(24,3,16),(25,3,17),(26,3,18),(27,1,24),(28,1,25),(29,2,26),(30,2,27);
/*!40000 ALTER TABLE `supplier_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `receipt_id` int DEFAULT NULL,
  `variant_id` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `receipt_id` (`receipt_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`receipt_id`) REFERENCES `receipt` (`receipt_id`),
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (1,1,1,280.00,1),(2,2,1,280.00,1),(3,3,1,280.00,1),(4,3,2,650.00,1),(5,3,3,95.00,1),(6,3,4,40.00,1),(7,3,5,550.00,1),(8,3,6,120.00,1),(9,3,7,1800.00,1),(10,3,8,380.00,1),(11,3,9,45.00,1),(12,3,10,1200.00,1),(13,3,11,270.00,1),(14,3,12,350.00,1),(15,3,13,180.00,1),(16,3,14,35.00,1),(17,3,15,480.00,1),(18,3,16,220.00,1),(19,3,17,2200.00,1),(20,3,18,420.00,1),(21,3,20,1500.00,1),(22,4,1,280.00,1),(23,4,2,650.00,1),(24,4,3,95.00,1),(25,4,4,40.00,1),(26,4,5,550.00,1),(27,4,6,120.00,1),(28,4,7,1800.00,1),(29,4,8,380.00,1),(30,4,9,45.00,1),(31,4,10,1200.00,1),(32,4,11,270.00,1),(33,4,12,350.00,1),(34,4,13,180.00,2),(35,4,14,35.00,1),(36,4,15,480.00,1),(37,4,17,2200.00,1),(38,4,18,420.00,1),(39,4,19,55.00,1),(40,4,20,1500.00,1),(41,5,1,280.00,1),(42,5,2,650.00,1),(43,5,3,95.00,1),(44,5,4,40.00,1),(45,5,5,550.00,1),(46,5,6,120.00,1),(47,5,7,1800.00,1),(48,5,8,380.00,1),(49,5,11,270.00,1),(50,5,13,180.00,1),(51,5,14,35.00,1),(52,5,15,480.00,1),(53,5,16,220.00,1),(54,5,17,2200.00,1),(55,5,18,420.00,1),(56,5,21,12.00,1),(57,5,22,110.00,1),(58,5,23,95.00,1),(59,5,24,85.00,1),(60,5,25,320.00,1),(61,5,26,35.00,1),(62,5,27,450.00,1),(63,5,28,280.00,1),(64,5,29,220.00,1),(65,5,31,260.00,1),(66,5,32,85.00,1),(67,5,33,140.00,1),(68,5,34,30.00,1),(69,5,35,620.00,1),(70,5,36,38.00,1),(71,5,37,95.00,1),(72,5,38,180.00,1),(73,5,39,380.00,1);
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `unit_id` int NOT NULL AUTO_INCREMENT,
  `unit_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
INSERT INTO `unit` VALUES (1,'Bag'),(2,'Board Feet'),(3,'Sheet'),(4,'Liter'),(5,'Length'),(6,'Roll'),(7,'Piece'),(8,'Cubic Meter'),(9,'Box'),(10,'Gallon');
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info`
--

DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `contact_num` varchar(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info`
--

LOCK TABLES `user_info` WRITE;
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
INSERT INTO `user_info` VALUES (1,1,'admin','09000000000'),(2,2,'juan@mail','09000000000'),(3,2,'1','1');
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variants`
--

DROP TABLE IF EXISTS `variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `variant` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_id` (`product_id`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `variants_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variants`
--

LOCK TABLES `variants` WRITE;
/*!40000 ALTER TABLE `variants` DISABLE KEYS */;
INSERT INTO `variants` VALUES (1,1,1,'PORREPBA-0001',150,285.00,'40kg'),(2,2,1,'PORHOLBA-0002',120,295.00,'40kg'),(3,3,1,'MASREPBA-0003',80,270.00,'40kg'),(4,4,2,'COCNULBF-0004',200,35.00,'2x3x10'),(5,5,2,'MAHPLYBF-0005',90,850.00,'1/4 inch'),(6,6,2,'MARPLYBF-0006',60,1200.00,'3/4 inch'),(7,7,3,'GISHEESH-0007',75,550.00,'#26'),(8,8,5,'ANGBARL-0008',100,420.00,'1x1x6m'),(9,9,5,'FLABARL-0009',80,310.00,'1/8x1x6m'),(10,10,4,'BOYLATEL-0010',50,780.00,'4L'),(11,11,4,'DAVLATEL-0011',45,820.00,'4L'),(12,12,4,'BOYPRIEL-0012',60,650.00,'4L'),(13,13,5,'PVCPIP1L-0013',110,95.00,'1/2 inch'),(14,14,5,'PVCPIP3L-0014',95,130.00,'3/4 inch'),(15,15,7,'GATVAL1P-0015',40,180.00,'1/2 inch'),(16,16,6,'THHWIR1R-0016',55,1850.00,'75m'),(17,17,6,'THHWIR1R-0017',48,1650.00,'75m'),(18,18,6,'DUPWIRR-0018',35,2100.00,'75m'),(19,19,3,'PREROOSH-0019',65,480.00,'#26'),(20,20,5,'RIDROLL-0020',30,350.00,'10ft'),(21,21,7,'CERFLOP-0021',200,28.00,'12x12'),(22,22,7,'CERWALLP-0022',180,32.00,'8x12'),(23,23,7,'GRATILP-0023',90,85.00,'24x24'),(24,24,7,'FIBINSB-0024',40,1200.00,'2 inch'),(25,25,7,'FOAMINS-0025',35,950.00,'1 inch'),(26,26,8,'WASSANM-0026',25,1200.00,'per m3'),(27,27,8,'RIVSAN-0027',20,1100.00,'per m3'),(28,28,7,'CHB4INC-0028',500,12.00,'4 inch'),(29,29,5,'DEF10MM-0029',120,185.00,'6m'),(30,30,5,'DEF12MM-0030',100,245.00,'6m');
/*!40000 ALTER TABLE `variants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-26 19:09:09
