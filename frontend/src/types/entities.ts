export interface Entity {
    id: string;
    name: string;
    type: "company" | "industry" | "topic";
    icon?: string;
    subscriber_count: number;
    is_subscribed: boolean;
}

export interface SubscriptionResponse {
    entity_id: string;
    is_subscribed: boolean;
}
