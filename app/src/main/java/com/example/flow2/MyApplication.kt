package com.example.flow2

import android.app.Application
import android.util.Log // Pour le log de confirmation
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth // <--- CHANGEMENT D'IMPORTATION
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.realtime.Realtime
// Importez io.ktor.client.engine.okhttp.OkHttp si vous l'utilisez ci-dessous
import io.ktor.client.engine.okhttp.OkHttp
// Si vous utilisez ContentNegotiation pour Ktor et kotlinx.serialization
// import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
// import io.ktor.serialization.kotlinx.json.json
// import kotlinx.serialization.json.Json

class MyApplication : Application() {

    companion object {
        lateinit var supabaseClient: SupabaseClient
            private set
        }

    override fun onCreate() {
        super.onCreate()

        supabaseClient = createSupabaseClient(
            supabaseUrl = "https://ekpximtmuwwxdkhrepna.supabase.co",
            supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcHhpbXRtdXd3eGRraHJlcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NjUyOTAsImV4cCI6MjA1NDI0MTI5MH0.h5ereVmY2dlzvxSPieM8_H4VMWwE_fbrHxa2PIJI4bQ"
        ) {
            install(Auth) {}
            install(Postgrest) {}
            install(Storage) {}
            install(Realtime) {}

        }

        Log.d("MyApplication", "Supabase client (v3 API style) initialized.")
    }
}