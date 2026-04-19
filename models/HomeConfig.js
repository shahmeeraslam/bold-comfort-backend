import mongoose from "mongoose";

const homeConfigSchema = new mongoose.Schema({
  // --- SECTION 01: HERO ---
  hero: {
    titleTop: { 
      type: String, 
      default: "Infinite" 
    },
    titleBottom: { 
      type: String, 
      default: "Potential" 
    },
    subtitle: { 
      type: String, 
      default: "Crafting the artifacts of a future defined by purpose and elegance." 
    },
    bgImage: { 
      type: String, 
      default: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" 
    },
    tagline: { 
      type: String, 
      default: "Horizon_Found_2026" 
    }
  },

  // --- SECTION 02: HIGHLIGHTS (Added) ---
  highlights: {
    title: { 
      type: String, 
      default: "The Vanguard" 
    },
    subtitle: { 
      type: String, 
      default: "Series" 
    },
    tagline: { 
      type: String, 
      default: "Real_Time_Assets" 
    }
    
  },
   featuredProducts: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Product' 
}],

lookbook: {
    title: { 
      type: String, 
      default: "The Gallery" 
    },
    tagline: { 
      type: String, 
      default: "Archive_Resonance" 
    }
  },
  // IDs for the curated list in the Lookbook interactive index
  lookbookProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],

  footwear: {
  title: { type: String, default: "Technical Footwear" },
  subtitle: { type: String, default: "Sculpted for ergonomic motion and structural integrity." },
  tagline: { type: String, default: "Kinetic_Architecture" }
},
footwearProducts: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Product' 
}],

 tickerMessages: {
    type: [String],
    default: ["SYSTEM_STABLE", "ARCHIVE_SYNC_COMPLETE", "PROTOCOL_V2.5_ACTIVE"]
  },

  footer: {
  brandTitleTop: { type: String, default: "Fragmented" },
  brandTitleBottom: { type: String, default: "Minimalism" },
  missionStatement: { type: String, default: "The information contained in this archive is proprietary." },
  socials: {
    instagram: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    github: { type: String, default: "#" }
  },
  legalLinks: [
    { label: { type: String }, url: { type: String } }
  ]
},

aboutPage: {
  // Section 01: The Big Title
  hero: {
    titleTop: { type: String, default: "Defining" },
    titleBottom: { type: String, default: "Quiet_Confidence." },
    sideNote: { type: String, default: "Operating at the intersection of tactile luxury." }
  },
  // Section 02: The Philosophy/Manifesto
  manifesto: {
    title: { type: String, default: "The 'Slow' Manifesto" },
    text: { type: String },
    image: { type: String }, // Large workshop image
    systemNote: { type: String, default: "[System_Note]: Fiber density verified." }
  },
  // Section 03: The Disciplines (Array)
  disciplines: [{
    id: String,
    title: String,
    description: String,
    imageUrl: String
  }]
},
  
  // --- SECTION 03: HUD/ANNOUNCEMENT ---
  announcement: {
    text: { 
      type: String, 
      default: "System_Update: New_Archive_Manifest_Live" 
    },
    isVisible: { 
      type: Boolean, 
      default: false 
    }
  },

  // Administrative Metadata
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

const HomeConfig = mongoose.model("HomeConfig", homeConfigSchema);

export default HomeConfig;