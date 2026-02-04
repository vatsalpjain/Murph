"""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘                      MURPH AI-ASSISTED ED-TECH PLATFORM                      â•‘
â•‘                         Machine Learning Pipeline                            â•‘
â•‘                                                                              â•‘
â•‘  Three Explainable Models for Hackathon Demo:                               â•‘
â•‘  1. Learning Success Predictor                                               â•‘
â•‘  2. Review Credibility Scorer (CORE FEATURE)                                 â•‘
â•‘  3. Drop-off Risk Predictor                                                  â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
"""

import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ML Libraries (sklearn only - no external dependencies)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             roc_auc_score, confusion_matrix, mean_squared_error,
                             r2_score, classification_report)

print("="*80)
print("MURPH ML PIPELINE - AI-ASSISTED ED-TECH MARKETPLACE")
print("="*80)
print()

# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# STEP 1: DATA LOADING & MERGING
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("STEP 1: DATA LOADING & MERGING")
print("-" * 80)

# Load datasets
video_df = pd.read_csv(r"C:\Users\walecha\Downloads\video_interactions.csv")
mcq_df = pd.read_csv(r"C:\Users\walecha\Downloads\mcq_assessments.csv")

print(f"âœ“ Video Interactions loaded: {video_df.shape}")
print(f"âœ“ MCQ Assessments loaded: {mcq_df.shape}")
print()

# Display column information
print("Video Interactions Columns:")
print(video_df.columns.tolist())
print()
print("MCQ Assessments Columns:")
print(mcq_df.columns.tolist())
print()

# Merge datasets on common keys
merge_keys = ['user_id', 'course_id', 'video_id', 'timestamp', 'device']
df = pd.merge(video_df, mcq_df, on=merge_keys, how='inner', suffixes=('_video', '_mcq'))

print(f"âœ“ Merged Dataset Shape: {df.shape}")
print()

# Handle missing values
print("Missing Values Check:")
missing_counts = df.isnull().sum()
print(missing_counts[missing_counts > 0] if missing_counts.sum() > 0 else "No missing values!")
print()

# Drop rows with critical missing values
df = df.dropna(subset=['watch_time_sec', 'video_length_sec', 'mcq_correct'])

print(f"âœ“ After handling missing values: {df.shape}")
print()

# Create derived features
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour_of_day'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek
df['watch_to_length_ratio'] = df['watch_time_sec'] / df['video_length_sec']

# Encode device type
le_device = LabelEncoder()
df['device_encoded'] = le_device.fit_transform(df['device'])

print("âœ“ Feature Engineering Complete")
print(f"  - hour_of_day: Extracted from timestamp")
print(f"  - day_of_week: Extracted from timestamp")
print(f"  - watch_to_length_ratio: watch_time / video_length")
print(f"  - device_encoded: {list(le_device.classes_)}")
print()

# Display dataset sample
print("Sample of Merged Dataset:")
print(df[['user_id', 'course_id', 'video_id', 'completion_percentage_video', 
          'watch_time_sec', 'mcq_correct', 'hour_of_day']].head(10))
print()
print()

# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# MODEL 1: LEARNING SUCCESS PREDICTOR
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("="*80)
print("MODEL 1: LEARNING SUCCESS PREDICTOR")
print("="*80)
print()
print("PURPOSE: Predict whether a learner will successfully solve MCQs based on")
print("         video engagement patterns.")
print()

# Prepare features and target
feature_cols_m1 = ['completion_percentage_video', 'watch_time_sec', 
                   'video_length_sec', 'device_encoded', 'hour_of_day']
X_m1 = df[feature_cols_m1].copy()
y_m1 = df['mcq_correct'].astype(int)  # Binary: 1 = correct, 0 = incorrect

print(f"Features: {feature_cols_m1}")
print(f"Target Distribution:")
print(y_m1.value_counts())
print(f"  Success Rate: {y_m1.mean():.2%}")
print()

# Train-Test Split
X_train_m1, X_test_m1, y_train_m1, y_test_m1 = train_test_split(
    X_m1, y_m1, test_size=0.2, random_state=42, stratify=y_m1
)

print(f"âœ“ Train set: {X_train_m1.shape[0]} samples")
print(f"âœ“ Test set: {X_test_m1.shape[0]} samples")
print()

# Train Gradient Boosting Classifier
print("Training Gradient Boosting Classifier...")
model_m1 = GradientBoostingClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
model_m1.fit(X_train_m1, y_train_m1)
print("âœ“ Model trained successfully")
print()

# Predictions
y_pred_m1 = model_m1.predict(X_test_m1)
y_pred_proba_m1 = model_m1.predict_proba(X_test_m1)[:, 1]

# Evaluation Metrics
print("EVALUATION METRICS:")
print("-" * 40)
accuracy_m1 = accuracy_score(y_test_m1, y_pred_m1)
precision_m1 = precision_score(y_test_m1, y_pred_m1)
recall_m1 = recall_score(y_test_m1, y_pred_m1)
roc_auc_m1 = roc_auc_score(y_test_m1, y_pred_proba_m1)

print(f"Accuracy:  {accuracy_m1:.4f}")
print(f"Precision: {precision_m1:.4f}")
print(f"Recall:    {recall_m1:.4f}")
print(f"ROC-AUC:   {roc_auc_m1:.4f}")
print()

print("Classification Report:")
print(classification_report(y_test_m1, y_pred_m1, 
                          target_names=['MCQ Failed', 'MCQ Passed']))

# Feature Importance
print("FEATURE IMPORTANCE:")
print("-" * 40)
feature_importance_m1 = pd.DataFrame({
    'feature': feature_cols_m1,
    'importance': model_m1.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance_m1.iterrows():
    print(f"{row['feature']:30s}: {row['importance']:.4f}")
print()

print("HOW THIS MODEL POWERS MURPH:")
print("-" * 40)
print("âœ“ Real-time Session Guidance: If predicted success probability < 50%,")
print("  suggest the learner to:")
print("  - Re-watch key sections")
print("  - Access supplementary materials")
print("  - Take a break and return when focused")
print()
print("âœ“ Adaptive Learning Paths: Route learners to easier/harder content based")
print("  on their engagement-to-success pattern")
print()
print("âœ“ Teacher Insights: Show which videos have low engagement-to-success rates,")
print("  helping instructors improve content quality")
print()
print()

# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# MODEL 2: REVIEW CREDIBILITY SCORER (CORE FEATURE)
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("="*80)
print("MODEL 2: REVIEW CREDIBILITY SCORER (CORE FEATURE)")
print("="*80)
print()
print("PURPOSE: Assess review credibility based on engagement depth and behavior")
print("         to protect teachers from unfair ratings and enable fair payment.")
print()

# Feature Engineering for Review Credibility
print("FEATURE ENGINEERING FOR CREDIBILITY SCORING:")
print("-" * 40)

# 1. Engagement Depth Score (0-1): combination of completion and time spent
df['engagement_depth_score'] = (
    0.6 * (df['completion_percentage_video'] / 100) + 
    0.4 * np.minimum(df['watch_to_length_ratio'], 1)
)

# 2. Early Exit Flag: Did user quit before 10% completion?
df['early_exit_flag'] = (df['completion_percentage_video'] < 10).astype(int)

# 3. MCQ Participation Flag: Did user attempt assessment?
df['mcq_participation_flag'] = df['mcq_attempted'].astype(int)

# 4. Consistent Learner Score: Based on completion consistency
# (In production, this would compare across multiple videos per user)
df['consistent_learner_score'] = np.where(
    df['completion_percentage_video'] > 60, 1.0,
    df['completion_percentage_video'] / 60
)

# 5. Time Investment Score: Normalized by video length
df['time_investment_score'] = np.minimum(
    df['watch_time_sec'] / (df['video_length_sec'] * 0.8), 1.0
)

# 6. Assessment Performance Weight: MCQ solve rate indicates effort
df['assessment_performance_weight'] = df['mcq_solve_rate']

print("âœ“ engagement_depth_score: Weighted avg of completion & watch ratio")
print("âœ“ early_exit_flag: Binary flag for <10% completion")
print("âœ“ mcq_participation_flag: Whether user attempted assessment")
print("âœ“ consistent_learner_score: Completion consistency indicator")
print("âœ“ time_investment_score: Time spent relative to video length")
print("âœ“ assessment_performance_weight: MCQ solve rate")
print()

# Rule-Based Baseline Credibility Score
print("BASELINE: RULE-BASED CREDIBILITY SCORE")
print("-" * 40)

def calculate_baseline_credibility(row):
    """
    Rule-based credibility score (0-1):
    - High engagement + MCQ participation = High credibility
    - Early exit = Very low credibility
    - No MCQ attempt but good completion = Medium credibility
    """
    score = 0.0
    
    # Early exit penalty
    if row['early_exit_flag'] == 1:
        return 0.1  # Very low credibility
    
    # Engagement component (40%)
    score += 0.4 * row['engagement_depth_score']
    
    # MCQ participation bonus (30%)
    if row['mcq_participation_flag'] == 1:
        score += 0.3 * row['assessment_performance_weight']
    
    # Time investment component (20%)
    score += 0.2 * row['time_investment_score']
    
    # Consistency bonus (10%)
    score += 0.1 * row['consistent_learner_score']
    
    return min(score, 1.0)

df['credibility_baseline'] = df.apply(calculate_baseline_credibility, axis=1)

print("Baseline Credibility Distribution:")
print(df['credibility_baseline'].describe())
print()

# ML Model for Credibility Scoring
print("MACHINE LEARNING: GRADIENT BOOSTING REGRESSOR")
print("-" * 40)

# Features for credibility model
feature_cols_m2 = [
    'engagement_depth_score',
    'early_exit_flag',
    'mcq_participation_flag',
    'consistent_learner_score',
    'time_investment_score',
    'assessment_performance_weight',
    'completion_percentage_video',
    'watch_time_sec',
    'device_encoded'
]

X_m2 = df[feature_cols_m2].copy()
y_m2 = df['credibility_baseline'].copy()  # Using baseline as target for demo

# Train-Test Split
X_train_m2, X_test_m2, y_train_m2, y_test_m2 = train_test_split(
    X_m2, y_m2, test_size=0.2, random_state=42
)

print(f"âœ“ Train set: {X_train_m2.shape[0]} samples")
print(f"âœ“ Test set: {X_test_m2.shape[0]} samples")
print()

# Train Gradient Boosting Regressor
print("Training Gradient Boosting Regressor...")
model_m2 = GradientBoostingRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.05,
    random_state=42
)
model_m2.fit(X_train_m2, y_train_m2)
print("âœ“ Model trained successfully")
print()

# Predictions
y_pred_m2 = model_m2.predict(X_test_m2)
y_pred_m2 = np.clip(y_pred_m2, 0, 1)  # Ensure scores are between 0 and 1

# Evaluation Metrics
print("EVALUATION METRICS:")
print("-" * 40)
mse_m2 = mean_squared_error(y_test_m2, y_pred_m2)
rmse_m2 = np.sqrt(mse_m2)
r2_m2 = r2_score(y_test_m2, y_pred_m2)

print(f"MSE:  {mse_m2:.6f}")
print(f"RMSE: {rmse_m2:.6f}")
print(f"RÂ²:   {r2_m2:.4f}")
print()

# Feature Importance
print("FEATURE IMPORTANCE:")
print("-" * 40)
feature_importance_m2 = pd.DataFrame({
    'feature': feature_cols_m2,
    'importance': model_m2.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance_m2.iterrows():
    print(f"{row['feature']:35s}: {row['importance']:.4f}")
print()

# Sample Credibility Scores
print("SAMPLE CREDIBILITY SCORES:")
print("-" * 40)
sample_indices = np.random.choice(X_test_m2.index, min(10, len(X_test_m2)), replace=False)
sample_results = pd.DataFrame({
    'completion_%': df.loc[sample_indices, 'completion_percentage_video'].values,
    'watch_time': df.loc[sample_indices, 'watch_time_sec'].values.astype(int),
    'mcq_attempted': df.loc[sample_indices, 'mcq_attempted'].values,
    'mcq_correct': df.loc[sample_indices, 'mcq_correct'].values,
    'credibility': y_pred_m2[X_test_m2.index.get_indexer(sample_indices)]
})

for idx, row in sample_results.iterrows():
    print(f"Completion: {row['completion_%']:5.1f}% | Watch: {int(row['watch_time']):4d}s | "
          f"MCQ: {int(row['mcq_attempted'])}/{int(row['mcq_correct'])} | "
          f"Credibility: {row['credibility']:.3f}")
print()

print("HOW CREDIBILITY SCORES POWER MURPH:")
print("-" * 40)
print("âœ“ WEIGHTED REVIEWS: Reviews are weighted by credibility score")
print("  - High credibility (>0.8): Full weight in teacher rating")
print("  - Medium credibility (0.5-0.8): Partial weight")
print("  - Low credibility (<0.5): Minimal or no weight")
print()
print("âœ“ TEACHER QUALITY BONUS: Teachers receive bonuses based on:")
print("  - Average rating from HIGH credibility reviews only")
print("  - This protects them from drive-by low ratings")
print()
print("âœ“ FAIR USAGE-BASED PAYMENT:")
print("  - Payment calculations use engagement-weighted completion")
print("  - Prevents payment fraud from users who game the system")
print()
print("âœ“ REPUTATION PROTECTION:")
print("  - Flag suspicious review patterns (e.g., early exit + 1-star)")
print("  - Allow teachers to contest low-credibility negative reviews")
print()
print()

# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# MODEL 3: DROP-OFF RISK PREDICTOR
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("="*80)
print("MODEL 3: DROP-OFF RISK PREDICTOR")
print("="*80)
print()
print("PURPOSE: Predict early session abandonment to enable real-time engagement")
print("         nudges and intervention strategies.")
print()

# Prepare features and target
feature_cols_m3 = ['watch_time_sec', 'video_length_sec', 'device_encoded', 
                   'hour_of_day', 'day_of_week']
X_m3 = df[feature_cols_m3].copy()

# Target: 1 if completion < 40%, 0 otherwise
y_m3 = (df['completion_percentage_video'] < 40).astype(int)

print(f"Features: {feature_cols_m3}")
print(f"Target Distribution (Drop-off Risk):")
print(y_m3.value_counts())
print(f"  Drop-off Rate: {y_m3.mean():.2%}")
print()

# Train-Test Split
X_train_m3, X_test_m3, y_train_m3, y_test_m3 = train_test_split(
    X_m3, y_m3, test_size=0.2, random_state=42, stratify=y_m3
)

print(f"âœ“ Train set: {X_train_m3.shape[0]} samples")
print(f"âœ“ Test set: {X_test_m3.shape[0]} samples")
print()

# Train Random Forest Classifier (fast and interpretable)
print("Training Random Forest Classifier...")
model_m3 = RandomForestClassifier(
    n_estimators=100,
    max_depth=8,
    random_state=42,
    n_jobs=-1
)
model_m3.fit(X_train_m3, y_train_m3)
print("âœ“ Model trained successfully")
print()

# Predictions
y_pred_m3 = model_m3.predict(X_test_m3)
y_pred_proba_m3 = model_m3.predict_proba(X_test_m3)[:, 1]

# Evaluation Metrics
print("EVALUATION METRICS:")
print("-" * 40)
accuracy_m3 = accuracy_score(y_test_m3, y_pred_m3)
precision_m3 = precision_score(y_test_m3, y_pred_m3)
recall_m3 = recall_score(y_test_m3, y_pred_m3)
roc_auc_m3 = roc_auc_score(y_test_m3, y_pred_proba_m3)

print(f"Accuracy:  {accuracy_m3:.4f}")
print(f"Precision: {precision_m3:.4f}")
print(f"Recall:    {recall_m3:.4f}")
print(f"ROC-AUC:   {roc_auc_m3:.4f}")
print()

print("Classification Report:")
print(classification_report(y_test_m3, y_pred_m3, 
                          target_names=['Will Complete', 'Will Drop Off']))

# Confusion Matrix
print("CONFUSION MATRIX:")
print("-" * 40)
cm_m3 = confusion_matrix(y_test_m3, y_pred_m3)
print(f"                  Predicted: Complete  |  Predicted: Drop-off")
print(f"Actual: Complete       {cm_m3[0,0]:6d}         |       {cm_m3[0,1]:6d}")
print(f"Actual: Drop-off       {cm_m3[1,0]:6d}         |       {cm_m3[1,1]:6d}")
print()

# Feature Importance
print("FEATURE IMPORTANCE:")
print("-" * 40)
feature_importance_m3 = pd.DataFrame({
    'feature': feature_cols_m3,
    'importance': model_m3.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance_m3.iterrows():
    print(f"{row['feature']:20s}: {row['importance']:.4f}")
print()

print("HOW THIS MODEL POWERS MURPH:")
print("-" * 40)
print("âœ“ REAL-TIME NUDGES: When drop-off probability > 70%:")
print("  - Show motivational message")
print("  - Offer quick recap or summary")
print("  - Suggest taking a short break")
print()
print("âœ“ ADAPTIVE CONTENT DELIVERY:")
print("  - Break long videos into smaller chunks for at-risk users")
print("  - Prioritize engaging content earlier in session")
print()
print("âœ“ TEACHER ANALYTICS:")
print("  - Identify specific video timestamps where users drop off")
print("  - Help teachers improve pacing and retention")
print()
print()

# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
# FINAL SUMMARY: HOW THESE MODELS POWER THE MURPH EXPERIENCE
# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("="*80)
print("HOW THESE MODELS POWER THE MURPH EXPERIENCE")
print("="*80)
print()

print("â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”")
print("â”‚ 1ï¸âƒ£  LEARNING SUCCESS PREDICTOR                                      â”‚")
print("â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜")
print()
print("ðŸŽ¯ IMPROVES LEARNER EXPERIENCE:")
print("   â€¢ Predicts struggle before it happens")
print("   â€¢ Provides personalized study recommendations")
print("   â€¢ Adapts difficulty based on engagement patterns")
print("   â€¢ Reduces frustration with timely interventions")
print()
print("ðŸ‘¨â€ðŸ« PROTECTS TEACHERS:")
print("   â€¢ Identifies videos that need improvement")
print("   â€¢ Shows which content correlates with learner success")
print("   â€¢ Helps optimize teaching strategies")
print()
print("ðŸ’° ENABLES FAIR PAYMENT:")
print("   â€¢ Validates genuine learning effort vs. passive watching")
print("   â€¢ Ensures payment reflects actual educational value delivered")
print()
print()

print("â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”")
print("â”‚ 2ï¸âƒ£  REVIEW CREDIBILITY SCORER (CORE INNOVATION)                     â”‚")
print("â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜")
print()
print("ðŸŽ¯ IMPROVES LEARNER EXPERIENCE:")
print("   â€¢ Shows credibility-weighted ratings (more accurate)")
print("   â€¢ Highlights reviews from engaged learners")
print("   â€¢ Filters out drive-by ratings")
print()
print("ðŸ‘¨â€ðŸ« PROTECTS TEACHERS:")
print("   â€¢ Prevents unfair ratings from users who barely watched")
print("   â€¢ Quality bonuses based on credible reviews only")
print("   â€¢ Right to contest low-credibility negative reviews")
print("   â€¢ Protection from coordinated rating attacks")
print()
print("ðŸ’° ENABLES FAIR PAYMENT:")
print("   â€¢ Teacher bonuses weighted by review credibility")
print("   â€¢ Payment adjustments reflect true engagement depth")
print("   â€¢ Prevents gaming through fake positive engagement")
print()
print()

print("â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”")
print("â”‚ 3ï¸âƒ£  DROP-OFF RISK PREDICTOR                                         â”‚")
print("â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜")
print()
print("ðŸŽ¯ IMPROVES LEARNER EXPERIENCE:")
print("   â€¢ Real-time engagement nudges")
print("   â€¢ Adaptive content pacing")
print("   â€¢ Personalized break suggestions")
print("   â€¢ Keeps learners motivated and on track")
print()
print("ðŸ‘¨â€ðŸ« PROTECTS TEACHERS:")
print("   â€¢ Identifies content sections causing drop-offs")
print("   â€¢ Provides actionable retention insights")
print("   â€¢ Helps improve course completion rates")
print()
print("ðŸ’° ENABLES FAIR PAYMENT:")
print("   â€¢ Higher completion rates = more payment opportunities")
print("   â€¢ Validates genuine viewing sessions")
print("   â€¢ Prevents incomplete-session payment disputes")
print()
print()

print("â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”")
print("â”‚ ðŸš€ COMPETITIVE ADVANTAGE                                            â”‚")
print("â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜")
print()
print("Unlike traditional ed-tech platforms that use simple metrics like")
print("'watched 80% = paid', Murph uses sophisticated ML to:")
print()
print("âœ“ Distinguish genuine engagement from passive viewing")
print("âœ“ Protect teacher reputation with credibility-weighted reviews")
print("âœ“ Enable fair, usage-based payment that can't be gamed")
print("âœ“ Provide real-time interventions to improve learning outcomes")
print()
print("This creates a TRUSTWORTHY MARKETPLACE where:")
print("â€¢ Learners get better recommendations and support")
print("â€¢ Teachers are fairly compensated and protected")
print("â€¢ The platform maintains quality and integrity")
print()

print("="*80)
print("PIPELINE EXECUTION COMPLETE")
print("="*80)
print()
print("All three models trained, evaluated, and ready for integration!")
print()
print("Next Steps for Hackathon Demo:")
print("1. Integrate models into Murph API endpoints")
print("2. Build real-time prediction dashboard")
print("3. Create teacher analytics interface")
print("4. Implement learner nudge system")
print()

# Save models for future use
import pickle

print("Saving trained models...")
with open(r"C:\Users\walecha\Downloads\model_learning_success.pkl", 'wb') as f:
    pickle.dump(model_m1, f)
with open(r"C:\Users\walecha\Downloads\model_credibility_scorer.pkl", 'wb') as f:
    pickle.dump(model_m2, f)
with open(r"C:\Users\walecha\Downloads\model_dropoff_risk.pkl", 'wb') as f:
    pickle.dump(model_m3, f)
print("âœ“ Models saved to Downloads")
print()

