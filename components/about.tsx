"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Hand, 
  Heart, 
  Users, 
  Target,
  Shield,
  Sparkles,
  Globe,
  Mail
} from "lucide-react"

const values = [
  {
    title: "Accessibility First",
    description: "We design for everyone, especially those who may find technology challenging. Large buttons, clear text, and simple navigation are core to our experience.",
    icon: Users
  },
  {
    title: "Privacy & Security",
    description: "Your health data is sensitive. We use industry-standard encryption and never share your personal information with third parties.",
    icon: Shield
  },
  {
    title: "Evidence-Based",
    description: "Our tests and exercises are based on established medical research. We work with healthcare professionals to ensure accuracy and relevance.",
    icon: Target
  },
  {
    title: "Continuous Improvement",
    description: "We actively listen to user feedback and regularly update MyTremor with new features and improvements based on your needs.",
    icon: Sparkles
  }
]



export function About() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Hand className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">About MyTremor</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Empowering people with tremors to better understand and manage their condition
        </p>
      </div>

      {/* Mission */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-foreground max-w-3xl mx-auto">
            MyTremor was created to give people living with tremors a simple, accessible way to 
            track their symptoms, understand their patterns, and communicate more effectively with 
            their healthcare providers. We believe that better data leads to better care.
          </p>
        </CardContent>
      </Card>

      {/* About MyTremor */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">About MyTremor</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
              <p>
                MyTremor is a website designed to help individuals monitor and better understand hand tremors 
                through simple digital tools. Tremors can make everyday tasks more challenging, and it can be 
                difficult to measure how severe they are or how they change over time.
              </p>
              <p>
                The platform provides interactive tremor tests that allow users to measure their hand stability 
                and track results across days, weeks, and months. By viewing trends in their data, users can 
                observe how their tremor severity changes over time.
              </p>
              <p>
                In addition to tremor testing, the website includes a daily survey system where users can 
                record lifestyle factors such as sleep, stress, caffeine consumption, and medication use. 
                Tracking these factors alongside tremor test results may help users identify patterns that 
                influence their symptoms.
              </p>
              <p>
                The goal of MyTremor is to make tremor monitoring easier and more accessible through a simple 
                web-based platform.
              </p>
              <p className="text-sm italic">
                MyTremor is intended to help users track and understand their symptoms, but it is not a medical 
                diagnostic tool. Individuals experiencing severe tremor symptoms should consult a healthcare professional.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {values.map((value) => (
            <Card key={value.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <value.icon className="w-5 h-5 text-primary" />
                  {value.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Creator */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Creator</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ronica Teimoori</CardTitle>
            <CardDescription className="text-primary font-medium">
              Creator & Developer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-muted-foreground">
              <p>
                My name is Ronica Teimoori, a sophomore from Washington with interests in both 
                computer science and health-related technology.
              </p>
              <p>
                As someone who experiences hand tremors personally, I wanted to build a tool that 
                could help people better track and understand their symptoms over time. MyTremor was 
                created as a way to combine technology and health awareness into a simple platform 
                that allows users to monitor tremor patterns in their daily lives.
              </p>
              <p>
                I am interested in continuing to explore how software and technology can be used to 
                build tools that support people{"'"}s health and everyday wellbeing.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Get in Touch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We{"'"}d love to hear from you! Whether you have feedback, questions, or just want to 
            share your experience with MyTremor, please reach out.
          </p>
          <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:Teimoori.ron@gmail.com" className="text-primary hover:underline">
                Teimoori.ron@gmail.com
              </a>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
