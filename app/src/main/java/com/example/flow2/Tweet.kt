// Tweet.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

@Serializable
data class Tweet(
    val id: String? = null,
    @SerialName("user_id")
    val userId: String? = null,
    val content: String? = null,
    @SerialName("image_url")
    private val rawImageUrl: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null,
    //@SerialName("Profile")
    //val authorProfile: Profile? = null
) {
    // Propriété calculée pour obtenir la première URL propre
    val firstImageUrl: String?
        get() = rawImageUrl?.let {
            try {
                // Essayer de parser la chaîne comme un tableau JSON
                val jsonElement = Json.parseToJsonElement(it)
                if (jsonElement.jsonArray.isNotEmpty()) {
                    jsonElement.jsonArray[0].jsonPrimitive.content
                } else {
                    null // Tableau vide
                }
            } catch (e: Exception) {
                if (it.startsWith("http")) it else null
            }
        }
}