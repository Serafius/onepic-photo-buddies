export interface Photographer {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    image: string;
    location: string;
}

export const photographers = [
    {
        id: "moutasem-id", // We'll keep this special ID for Moutasem
        name: "Moutasem Bellah",
        specialty: "Event Photography",
        rating: 5.0,
        image: "/lovable-uploads/71da2de9-90e4-4e69-a867-55b6102a0bdd.png",
        location: "Luxembourg, Alzette",
    },
    {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Sarah Johnson",
        specialty: "Wedding Photography",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
        location: "New York, NY",
    },
    {
        id: "b47ac10b-58cc-4372-a567-0e02b2c3d480",
        name: "Michael Chen",
        specialty: "Portrait Photography",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
        location: "Los Angeles, CA",
    },
    {
        id: "c47ac10b-58cc-4372-a567-0e02b2c3d481",
        name: "Emma Davis",
        specialty: "Event Photography",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
        location: "Chicago, IL",
    },
];