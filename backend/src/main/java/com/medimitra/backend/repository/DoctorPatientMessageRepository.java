package com.medimitra.backend.repository;

import com.medimitra.backend.model.DoctorPatientMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public class DoctorPatientMessageRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<DoctorPatientMessage> messageRowMapper = new RowMapper<DoctorPatientMessage>() {
        @Override
        public DoctorPatientMessage mapRow(ResultSet rs, int rowNum) throws SQLException {
            DoctorPatientMessage message = new DoctorPatientMessage();
            message.setId(rs.getString("id"));
            message.setDoctorId(rs.getString("doctor_id"));
            message.setPatientId(rs.getString("patient_id"));
            message.setAppointmentId(rs.getString("appointment_id"));
            message.setSenderType(rs.getString("sender_type"));
            message.setMessage(rs.getString("message"));
            message.setMessageType(rs.getString("message_type"));
            message.setAttachmentUrl(rs.getString("attachment_url"));
            message.setIsRead(rs.getBoolean("is_read"));
            message.setReadAt(rs.getTimestamp("read_at") != null ? rs.getTimestamp("read_at").toLocalDateTime() : null);
            message.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return message;
        }
    };

    public void save(DoctorPatientMessage message) {
        String sql = """
            INSERT INTO doctor_patient_messages 
            (id, doctor_id, patient_id, appointment_id, sender_type, message, message_type, attachment_url, is_read, read_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        
        jdbcTemplate.update(sql,
            message.getId(),
            message.getDoctorId(),
            message.getPatientId(),
            message.getAppointmentId(),
            message.getSenderType(),
            message.getMessage(),
            message.getMessageType(),
            message.getAttachmentUrl(),
            message.getIsRead(),
            message.getReadAt(),
            message.getCreatedAt()
        );
    }

    public List<DoctorPatientMessage> findMessagesBetweenDoctorAndPatient(String doctorId, String patientId) {
        String sql = """
            SELECT * FROM doctor_patient_messages 
            WHERE doctor_id = ? AND patient_id = ?
            ORDER BY created_at ASC
            """;
        
        return jdbcTemplate.query(sql, messageRowMapper, doctorId, patientId);
    }

    public List<Map<String, Object>> findConversationsByUser(String userEmail) {
        // If userEmail is "system", return all conversations grouped by doctor-patient pair
        if ("system".equals(userEmail)) {
            String sql = """
                SELECT DISTINCT
                    m.doctor_id,
                    COALESCE(du.name, 'Unknown Doctor') as doctor_name,
                    COALESCE(d.specialization, 'General Medicine') as specialization,
                    m.patient_id,
                    COALESCE(u.name, 'Unknown Patient') as patient_name,
                    COALESCE(u.email, 'unknown@example.com') as patient_email,
                    m.appointment_id,
                    COALESCE(a.status, 'completed') as appointment_status,
                    (SELECT COUNT(*) FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id AND is_read = false 
                     AND sender_type = 'patient') as unread_count,
                    (SELECT message FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM doctor_patient_messages m
                LEFT JOIN doctors d ON m.doctor_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                LEFT JOIN users u ON m.patient_id = u.id
                LEFT JOIN appointments a ON m.appointment_id = a.id
                ORDER BY last_message_time DESC
                """;
            return jdbcTemplate.queryForList(sql);
        }
        
        // First, determine if the user is a doctor or patient
        String checkUserSql = "SELECT role FROM users WHERE email = ?";
        String userRole = null;
        try {
            userRole = jdbcTemplate.queryForObject(checkUserSql, String.class, userEmail);
        } catch (Exception e) {
            return new ArrayList<>();
        }

        if ("doctor".equals(userRole)) {
            // For doctors, get conversations with their patients
            String sql = """
                SELECT DISTINCT
                    m.doctor_id,
                    du.name as doctor_name,
                    d.specialization,
                    m.patient_id,
                    u.name as patient_name,
                    u.email as patient_email,
                    m.appointment_id,
                    a.status as appointment_status,
                    (SELECT COUNT(*) FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id AND is_read = false 
                     AND sender_type = 'patient') as unread_count,
                    (SELECT message FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM doctor_patient_messages m
                JOIN doctors d ON m.doctor_id = d.id
                JOIN users du ON d.user_id = du.id
                JOIN users u ON m.patient_id = u.id
                LEFT JOIN appointments a ON m.appointment_id = a.id
                WHERE d.user_id IN (SELECT id FROM users WHERE email = ?)
                ORDER BY last_message_time DESC
                """;
            return jdbcTemplate.queryForList(sql, userEmail);
        } else {
            // For patients, get conversations with their doctors
            String sql = """
                SELECT DISTINCT
                    m.doctor_id,
                    du.name as doctor_name,
                    d.specialization,
                    m.patient_id,
                    u.name as patient_name,
                    u.email as patient_email,
                    m.appointment_id,
                    a.status as appointment_status,
                    (SELECT COUNT(*) FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id AND is_read = false 
                     AND sender_type = 'doctor') as unread_count,
                    (SELECT message FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM doctor_patient_messages 
                     WHERE doctor_id = m.doctor_id AND patient_id = m.patient_id 
                     ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM doctor_patient_messages m
                JOIN doctors d ON m.doctor_id = d.id
                JOIN users du ON d.user_id = du.id
                JOIN users u ON m.patient_id = u.id
                LEFT JOIN appointments a ON m.appointment_id = a.id
                WHERE u.email = ?
                ORDER BY last_message_time DESC
                """;
            return jdbcTemplate.queryForList(sql, userEmail);
        }
    }

    public void markAsRead(String messageId, LocalDateTime readAt) {
        String sql = "UPDATE doctor_patient_messages SET is_read = true, read_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, readAt, messageId);
    }

    public int getUnreadCountForUser(String userEmail) {
        String sql = """
            SELECT COUNT(*) FROM doctor_patient_messages m
            JOIN doctors d ON m.doctor_id = d.id
            JOIN users u ON m.patient_id = u.id
            WHERE (d.user_id IN (SELECT id FROM users WHERE email = ?) OR u.email = ?)
            AND m.is_read = false
            AND m.sender_type != ?
            """;
        
        String senderType = userEmail.contains("@") ? "patient" : "doctor";
        return jdbcTemplate.queryForObject(sql, Integer.class, userEmail, userEmail, senderType);
    }
}

