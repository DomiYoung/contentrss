# Specification: Entity Radar (Feature 003)

## 1. Background
Users need to focus on specific segments of industry news. The Entity Radar categorizes intelligence by entities (Company, Person, Topic) and allows personalization.

## 2. Requirements
- **Radar View**: A high-tech list of trackable entities.
- **Subscription**: Toggle state per entity.
- **Filtering**: The Home Feed should have a "My Radar" mode.

## 3. Data Model
- **Entity**: `id, name, type (company/industry/topic), icon, subscriber_count`.
- **Subscription**: `user_id, entity_id`.
