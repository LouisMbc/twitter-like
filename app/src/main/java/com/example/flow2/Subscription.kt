// Subscription.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
// Pour kotlinx.datetime.Instant si vous utilisez timestamptz et voulez des types plus précis
// import kotlinx.datetime.Instant

@Serializable
data class Subscription(
    val id: String, // UUID - Clé primaire

    @SerialName("profile_id")
    val profileId: String, // UUID de Profile.id

    @SerialName("customer_id")
    val customerId: String, // ID client du fournisseur de paiement

    @SerialName("subscription_id")
    val subscriptionId: String, // ID abonnement du fournisseur de paiement

    val plan: String, // Identifiant du plan

    val status: String, // Statut de l'abonnement (ex: "active", "canceled")

    @SerialName("current_period_end")
    val currentPeriodEnd: String, // Timestamp (représenté comme String pour la simplicité avec Instant)
    // ou utilisez kotlinx.datetime.Instant et un sérialiseur

    @SerialName("cancel_at_period_end")
    val cancelAtPeriodEnd: Boolean = false,

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    @SerialName("updated_at")
    val updatedAt: String, // Timestamp

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    @SerialName("Profile") // Pour les détails de l'utilisateur abonné
    val userProfile: Profile? = null
)