// Home.kt
package com.example.flow2

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.bottomnavigation.BottomNavigationView
// import com.example.flow2.databinding.ActivityHomeBinding // Si vous utilisez ViewBinding

class Home : AppCompatActivity() {

    // private lateinit var binding: ActivityHomeBinding // Pour ViewBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        // Sans ViewBinding
        setContentView(R.layout.activity_home)
        val navView: BottomNavigationView = findViewById(R.id.bottom_nav_view)
        val toolbar: MaterialToolbar = findViewById(R.id.homeToolbar) // Récupérer la Toolbar

        setSupportActionBar(toolbar) // Important pour que la Toolbar agisse comme ActionBar
        supportActionBar?.setDisplayShowTitleEnabled(false) // Pour ne pas afficher le titre par défaut si vous avez votre logo

        // Trouver le NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment_home) as NavHostFragment
        val navController = navHostFragment.navController

        // Configurer la BottomNavigationView avec le NavController
        navView.setupWithNavController(navController)
    }
}