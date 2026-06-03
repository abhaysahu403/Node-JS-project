import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getAll(true);
        setJobs(response.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load job postings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h1>Job Postings</h1>
        <p>Explore open positions at Cloud Nexus</p>
      </div>

      {loading && <div className="loading">Loading job postings...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && jobs.length === 0 && !error && (
        <div className="no-data">No job postings available</div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="jobs-container">
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="job-card"
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="department-tag">{job.department}</span>
                </div>
                <p className="location">📍 {job.location || 'Remote'}</p>
                <p className="job-description">{job.description?.substring(0, 100)}...</p>

                {selectedJob?.id === job.id && (
                  <div className="job-details">
                    <p><strong>Full Description:</strong></p>
                    <p>{selectedJob.description}</p>
                    <button className="apply-btn">Apply Now</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="result-count">Total: {jobs.length} open positions</div>
        </div>
      )}
    </div>
  );
};

export default JobPostings;
