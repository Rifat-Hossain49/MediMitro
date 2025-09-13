package com.medimitra.backend.repository;

import com.medimitra.backend.model.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AppointmentRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Appointment> appointmentRowMapper = new RowMapper<Appointment>() {
        @Override
        public Appointment mapRow(ResultSet rs, int rowNum) throws SQLException {
            Appointment appointment = new Appointment();
            appointment.setId(rs.getString("id"));
            appointment.setPatientId(rs.getString("patient_id"));
            appointment.setDoctorId(rs.getString("doctor_id"));
            
            if (rs.getTimestamp("date_time") != null) {
                appointment.setDateTime(rs.getTimestamp("date_time").toLocalDateTime());
            }
            
            appointment.setDuration(rs.getInt("duration"));
            appointment.setType(rs.getString("type"));
            appointment.setStatus(rs.getString("status"));
            appointment.setNotes(rs.getString("notes"));
            appointment.setSymptoms(rs.getString("symptoms"));
            appointment.setDiagnosis(rs.getString("diagnosis"));
            appointment.setPrescription(rs.getString("prescription"));
            appointment.setFee(rs.getBigDecimal("fee"));
            
            if (rs.getTimestamp("created_at") != null) {
                appointment.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            if (rs.getTimestamp("updated_at") != null) {
                appointment.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }
            
            return appointment;
        }
    };

    public Appointment save(Appointment appointment) {
        if (appointment.getId() == null) {
            // Create new appointment
            appointment.setId(UUID.randomUUID().toString());
            appointment.setCreatedAt(LocalDateTime.now());
            appointment.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                INSERT INTO appointments (id, patient_id, doctor_id, date_time, duration, type, 
                                        status, notes, symptoms, diagnosis, prescription, fee, 
                                        created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            jdbcTemplate.update(sql,
                appointment.getId(), appointment.getPatientId(), appointment.getDoctorId(),
                appointment.getDateTime(), appointment.getDuration(), appointment.getType(),
                appointment.getStatus(), appointment.getNotes(), appointment.getSymptoms(),
                appointment.getDiagnosis(), appointment.getPrescription(), appointment.getFee(),
                appointment.getCreatedAt(), appointment.getUpdatedAt()
            );
        } else {
            // Update existing appointment
            appointment.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                UPDATE appointments SET patient_id = ?, doctor_id = ?, date_time = ?, duration = ?, 
                                     type = ?, status = ?, notes = ?, symptoms = ?, diagnosis = ?, 
                                     prescription = ?, fee = ?, updated_at = ?
                WHERE id = ?
                """;
            
            jdbcTemplate.update(sql,
                appointment.getPatientId(), appointment.getDoctorId(), appointment.getDateTime(),
                appointment.getDuration(), appointment.getType(), appointment.getStatus(),
                appointment.getNotes(), appointment.getSymptoms(), appointment.getDiagnosis(),
                appointment.getPrescription(), appointment.getFee(), appointment.getUpdatedAt(),
                appointment.getId()
            );
        }
        return appointment;
    }

    public Optional<Appointment> findById(String id) {
        try {
            String sql = "SELECT * FROM appointments WHERE id = ?";
            Appointment appointment = jdbcTemplate.queryForObject(sql, appointmentRowMapper, id);
            return Optional.of(appointment);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Appointment> findAll() {
        String sql = "SELECT * FROM appointments ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper);
    }

    public List<Appointment> findByPatientId(String patientId) {
        String sql = "SELECT * FROM appointments WHERE patient_id = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, patientId);
    }

    public List<Appointment> findByDoctorId(String doctorId) {
        String sql = "SELECT * FROM appointments WHERE doctor_id = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, doctorId);
    }

    public List<Appointment> findByStatus(String status) {
        String sql = "SELECT * FROM appointments WHERE status = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, status);
    }

    public List<Appointment> findByType(String type) {
        String sql = "SELECT * FROM appointments WHERE type = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, type);
    }

    public List<Appointment> findByPatientIdAndStatus(String patientId, String status) {
        String sql = "SELECT * FROM appointments WHERE patient_id = ? AND status = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, patientId, status);
    }

    public List<Appointment> findByDoctorIdAndStatus(String doctorId, String status) {
        String sql = "SELECT * FROM appointments WHERE doctor_id = ? AND status = ? ORDER BY date_time DESC";
        return jdbcTemplate.query(sql, appointmentRowMapper, doctorId, status);
    }

    public List<Appointment> findByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        String sql = "SELECT * FROM appointments WHERE date_time BETWEEN ? AND ? ORDER BY date_time";
        return jdbcTemplate.query(sql, appointmentRowMapper, startDate, endDate);
    }

    public List<Appointment> findByDoctorIdAndDateRange(String doctorId, LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT * FROM appointments 
            WHERE doctor_id = ? AND date_time BETWEEN ? AND ? 
            ORDER BY date_time
            """;
        return jdbcTemplate.query(sql, appointmentRowMapper, doctorId, startDate, endDate);
    }

    public List<Appointment> findByPatientIdAndDateRange(String patientId, LocalDateTime startDate, LocalDateTime endDate) {
        String sql = """
            SELECT * FROM appointments 
            WHERE patient_id = ? AND date_time BETWEEN ? AND ? 
            ORDER BY date_time
            """;
        return jdbcTemplate.query(sql, appointmentRowMapper, patientId, startDate, endDate);
    }

    public List<Appointment> findUpcomingAppointments(String userId, String userRole) {
        LocalDateTime now = LocalDateTime.now();
        String sql;
        
        if ("doctor".equals(userRole)) {
            sql = """
                SELECT * FROM appointments 
                WHERE doctor_id = ? AND date_time > ? AND status = 'scheduled'
                ORDER BY date_time
                """;
        } else {
            sql = """
                SELECT * FROM appointments 
                WHERE patient_id = ? AND date_time > ? AND status = 'scheduled'
                ORDER BY date_time
                """;
        }
        
        return jdbcTemplate.query(sql, appointmentRowMapper, userId, now);
    }

    public List<Appointment> findTodaysAppointments(String doctorId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        String sql = """
            SELECT * FROM appointments 
            WHERE doctor_id = ? AND date_time BETWEEN ? AND ? 
            ORDER BY date_time
            """;
        
        return jdbcTemplate.query(sql, appointmentRowMapper, doctorId, startOfDay, endOfDay);
    }

    public boolean hasConflictingAppointment(String doctorId, LocalDateTime dateTime, int duration, String excludeId) {
        LocalDateTime endTime = dateTime.plusMinutes(duration);
        
        String sql = """
            SELECT COUNT(*) FROM appointments 
            WHERE doctor_id = ? AND status = 'scheduled' 
            AND (id IS NULL OR id != COALESCE(?, '')) 
            AND (
                (date_time < ? AND date_time + INTERVAL '1 minute' * duration > ?) OR
                (date_time < ? AND date_time + INTERVAL '1 minute' * duration >= ?)
            )
            """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, 
            doctorId, excludeId, endTime, dateTime, endTime, dateTime);
        return count != null && count > 0;
    }

    public void deleteById(String id) {
        String sql = "DELETE FROM appointments WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public long count() {
        String sql = "SELECT COUNT(*) FROM appointments";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
        return count != null ? count : 0;
    }

    public long countByPatientId(String patientId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE patient_id = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, patientId);
        return count != null ? count : 0;
    }

    public long countByDoctorId(String doctorId) {
        String sql = "SELECT COUNT(*) FROM appointments WHERE doctor_id = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, doctorId);
        return count != null ? count : 0;
    }
}

