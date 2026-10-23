package org.nasweo.common.util;

import com.opencsv.CSVReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Slf4j
public class SpreadsheetReader {

    /**
     * Reads spreadsheet rows from either .xlsx or .csv files.
     * Returns a list of rows, where each row is a list of cell string values.
     */
    public static List<List<String>> readRows(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (filename.endsWith(".csv") || filename.endsWith(".txt")) {
            return readCsv(file);
        } else {
            // Default to XLSX parser
            try {
                return readXlsx(file);
            } catch (Exception ex) {
                log.warn("XLSX parsing failed, falling back to CSV parser: {}", ex.getMessage());
                return readCsv(file);
            }
        }
    }

    public static List<List<String>> readCsv(MultipartFile file) throws Exception {
        List<List<String>> records = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] line;
            while ((line = reader.readNext()) != null) {
                records.add(Arrays.asList(line));
            }
        }
        return records;
    }

    public static List<List<String>> readXlsx(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();

        List<String> sharedStrings = new ArrayList<>();
        byte[] sheetXmlBytes = null;

        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("xl/sharedStrings.xml".equalsIgnoreCase(entry.getName())) {
                    sharedStrings = parseSharedStrings(zis.readAllBytes());
                } else if (entry.getName().startsWith("xl/worksheets/sheet") && entry.getName().endsWith(".xml")) {
                    if (sheetXmlBytes == null) {
                        sheetXmlBytes = zis.readAllBytes();
                    }
                }
                zis.closeEntry();
            }
        }

        if (sheetXmlBytes == null) {
            throw new IllegalArgumentException("No worksheet XML found in XLSX file");
        }

        return parseSheetXml(sheetXmlBytes, sharedStrings);
    }

    private static List<String> parseSharedStrings(byte[] xmlBytes) {
        List<String> list = new ArrayList<>();
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlBytes));
            doc.getDocumentElement().normalize();

            NodeList siNodes = doc.getElementsByTagName("si");
            for (int i = 0; i < siNodes.getLength(); i++) {
                Element si = (Element) siNodes.item(i);
                NodeList tNodes = si.getElementsByTagName("t");
                StringBuilder sb = new StringBuilder();
                for (int j = 0; j < tNodes.getLength(); j++) {
                    sb.append(tNodes.item(j).getTextContent());
                }
                list.add(sb.toString().trim());
            }
        } catch (Exception e) {
            log.error("Error reading shared strings: {}", e.getMessage());
        }
        return list;
    }

    private static List<List<String>> parseSheetXml(byte[] xmlBytes, List<String> sharedStrings) throws Exception {
        List<List<String>> rows = new ArrayList<>();
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xmlBytes));
        doc.getDocumentElement().normalize();

        NodeList rowNodes = doc.getElementsByTagName("row");
        for (int r = 0; r < rowNodes.getLength(); r++) {
            Element rowEl = (Element) rowNodes.item(r);
            NodeList cNodes = rowEl.getElementsByTagName("c");

            Map<Integer, String> cellMap = new TreeMap<>();
            int maxCol = -1;

            for (int c = 0; c < cNodes.getLength(); c++) {
                Element cEl = (Element) cNodes.item(c);
                String cellRef = cEl.getAttribute("r"); // e.g., "A1", "B2"
                String cellType = cEl.getAttribute("t"); // "s" for shared string

                int colIndex = getColumnIndexFromRef(cellRef);
                if (colIndex > maxCol) maxCol = colIndex;

                NodeList vNodes = cEl.getElementsByTagName("v");
                String value = "";
                if (vNodes.getLength() > 0) {
                    value = vNodes.item(0).getTextContent().trim();
                    if ("s".equals(cellType)) {
                        try {
                            int idx = Integer.parseInt(value);
                            if (idx >= 0 && idx < sharedStrings.size()) {
                                value = sharedStrings.get(idx);
                            }
                        } catch (Exception ignored) {}
                    }
                }
                cellMap.put(colIndex, value);
            }

            List<String> rowValues = new ArrayList<>();
            for (int i = 0; i <= maxCol; i++) {
                rowValues.add(cellMap.getOrDefault(i, ""));
            }
            if (!rowValues.isEmpty()) {
                rows.add(rowValues);
            }
        }

        return rows;
    }

    private static int getColumnIndexFromRef(String ref) {
        if (ref == null || ref.isEmpty()) return 0;
        int col = 0;
        for (int i = 0; i < ref.length(); i++) {
            char ch = ref.charAt(i);
            if (Character.isLetter(ch)) {
                col = col * 26 + (Character.toUpperCase(ch) - 'A' + 1);
            } else {
                break;
            }
        }
        return Math.max(0, col - 1);
    }
}
