// Hashtag.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Hashtag(
    val id: Int, // int4 correspond à Int
    val content: String, // Le texte du hashtag
)