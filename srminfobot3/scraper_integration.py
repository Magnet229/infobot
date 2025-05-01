# scraper_integration.py
import json
from datetime import datetime


import logging
class SRMKnowledgeBase:
    def __init__(self, data_file='srm_data_improved1.json',structured_data_file='srm_structured_data.json'):
        self.data_file = data_file
        self.structured_data_file = structured_data_file
        self.last_update = None
        #self.knowledge_base = self.load_data()
        try:
            self.knowledge_base = self.load_data()
        except Exception as e:
            logging.error(f"Critical error initializing knowledge base: {str(e)}")
            raise
    def load_data(self):
    
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.last_update = datetime.now()
            try:
                with open(self.structured_data_file, 'r', encoding='utf-8') as f:
                    structured_data = json.load(f)
                    # Merge structured_data into the existing data structure
                    data['programs_ug'] = structured_data.get('programs_ug', {})
                    data['programs_pg'] = structured_data.get('programs_pg', {})
                    data['fees_ug'] = structured_data.get('fees_ug', {})
                    data['fees_pg'] = structured_data.get('fees_pg', {})
                    data['scholarships'] = structured_data.get('scholarships', [])
                    logging.info("Structured data loaded and merged successfully")
            except FileNotFoundError:
                logging.warning(f"Structured data file {self.structured_data_file} not found.")
            except json.JSONDecodeError:
                logging.error(f"Error decoding JSON from {self.structured_data_file}")

            return data
        except FileNotFoundError:
            logging.warning(f"Data file {self.data_file} not found. Returning empty knowledge base.")
            return {
                'general_info': {},
                'programs': [],
                'departments': [],
                'faculty': [],
                'research': [],
                'news_events': [],
                'facilities': [],
                'admissions': [],
                'campus_life': {},
                'fees_ug': {},  # Added these for structured data
                'fees_pg': {},
                'programs_ug': {},
                'programs_pg': {},
                'scholarships': []
            }
        except json.JSONDecodeError:
            logging.error(f"Error decoding JSON from {self.data_file}")
            return {
                'general_info': {},
                'programs': [],
                'departments': [],
                'faculty': [],
                'research': [],
                'news_events': [],
                'facilities': [],
                'admissions': [],
                'campus_life': {},
                'fees_ug': {},  # Added these for structured data
                'fees_pg': {},
                'programs_ug': {},
                'programs_pg': {},
                'scholarships': []
            }

        
    def find_ug_fees(self, program_name):
        program_name = program_name.lower()
        for prog, details_list in self.knowledge_base.get('programs_ug', {}).items():
            if program_name in prog.lower():
                for details in details_list:
                    if "annual fees" in details.lower():
                        return f"{prog}: {details}"
        return None 
    def search_knowledge_base(self, query):
        """Search through knowledge base for relevant information"""
        query_terms = query.lower().split()
        results = []
        cse_keywords = ['cse', 'computer science', 'computer engineering']
        fee_keywords = ['fees', 'fee', 'fee structure', 'tuition', 'cost', 'expenses', 'scholarships']
        ece_keywords = ['ece', 'electronics', 'communication', 'engineering']
        scholarship_keywords = ['scholarship', 'scholarships', 'financial aid', 'funding']
        kattankulathur_keywords = ['kattankulathur', 'kattankulattur', 'main campus']
        is_cse_query = any(keyword in query.lower() for keyword in cse_keywords)
        is_fee_query = any(keyword in query.lower() for keyword in fee_keywords)
        is_ece_query = any(keyword in query.lower() for keyword in ece_keywords)
        is_scholarship_query = any(keyword in query.lower() for keyword in scholarship_keywords)
        is_kattankulathur_query = any(keyword in query.lower() for keyword in kattankulathur_keywords) 
        # Define category weights for relevance scoring
        category_weights = {
            'general_info': 0.5,
            'programs': 0.6,
            'departments': 0.4,
            'faculty': 0.3,
            'research': 0.2,
            'news_events': 0.1,
            'facilities': 0.4,
            'admissions': 0.6,
            'campus_life': 0.3,
            'fees_ug': 0.9 if is_fee_query and is_cse_query and is_kattankulathur_query else 0.3, # Modified fees
            'fees_pg': 0.9 if is_fee_query and is_cse_query and is_kattankulathur_query else 0.3, # Modified fees
            'programs_ug': 0.6,
            'programs_pg': 0.6,
            'scholarships': 0.9 if is_scholarship_query else 0.3 # Modified scholarships
        }

        if is_fee_query and is_cse_query and is_kattankulathur_query :
            program_name = "computer science and engineering" #program name to match
            fees_info = self.find_ug_fees(program_name)
            if fees_info:
                results.append((fees_info, category_weights.get('programs_ug', 0.5), None))
            # Search within UG programs
            for program, details_list in self.knowledge_base.get('programs_ug', {}).items():  # Use .get() for safety
                if "computer science" in program.lower() or "cse" in program.lower():  # Check name of program
                    for details in details_list:  # details list since value is a list
                        if "annual fees" in details.lower():  # Extract fees
                            results.append((f"{program}: {details}", category_weights.get('programs_ug', 0.5), None))  # Append result

            # Search within PG programs (you may want to add PG-specific search logic)
            for program, details_list in self.knowledge_base.get('programs_pg', {}).items():
                if "computer science" in program.lower() or "cse" in program.lower():  # Check name of program
                    for details in details_list:  # details list since value is a list
                        if "annual fees" in details.lower():  # Extract fees
                            results.append((f"{program}: {details}", category_weights.get('programs_pg', 0.5), None))  # Append result

        # Search through the scholarships
        elif is_scholarship_query:
            for scholarship in self.knowledge_base.get('scholarships', []):
                content = str(scholarship).lower()
                score = sum(1 for term in query_terms if term in content)
                if score > 0:
                    results.append((str(scholarship), score * category_weights.get('scholarships', 0.5), None))


                        

            # Search through the scholarships
            for scholarship in self.knowledge_base.get('scholarships', []):
                content = str(scholarship).lower()
                score = sum(1 for term in query_terms if term in content)
                if score > 0:
                    results.append((str(scholarship), score * category_weights.get('scholarships', 0.5), None))

        

        for category, items in self.knowledge_base.items():
            weight = category_weights.get(category, 0.5)
            if isinstance(items, list):
                for item in items:
                    if isinstance(item, dict):
                        content = ' '.join(str(v) for v in item.values()).lower()
                    else:
                        content = str(item).lower()
                
                # Calculate match score
                    score = sum(1 for term in query_terms if term in content)
                    if score > 0:
                        results.append((content, score * weight))
                    
            elif isinstance(items, dict):
                for key, value in items.items():
                    content = str(value).lower()
                    score = sum(1 for term in query_terms if term in content)
                    if score > 0:
                        results.append((value, score * weight))

    # Sort by descending score and return top 3
        results.sort(key=lambda x: x[1], reverse=True)
        return [result[0] for result in results[:3]]

    def _check_relevance(self, query, content):
        """Check if content is relevant to query"""
        query_terms = query.lower().split()
        content = content.lower()
        return any(term in content for term in query_terms)

    def _calculate_relevance(self, query, content):
        """Calculate relevance score between query and content"""
        query_terms = set(query.lower().split())
        content_terms = set(content.lower().split())
        
        # Calculate Jaccard similarity
        intersection = len(query_terms.intersection(content_terms))
        union = len(query_terms.union(content_terms))
        
        if union == 0:
            return 0
        
        return intersection / union

    '''def format_response(self, results):
        """Format search results into a coherent response"""
        if not results:
            return None
            
        response_parts = []
        
        for result in results:
            category = result['category'].replace('_', ' ').title()
            content = result['content']
            
            if isinstance(content, dict):
                # Format dictionary content
                content_str = '. '.join(f"{k}: {v}" for k, v in content.items() if k != 'url')
            else:
                content_str = str(content)
            
            response_parts.append(f"{category}: {content_str}")
        
        return '\n\n'.join(response_parts)'''
    

    def format_response(self, results):
        """Format the response from the knowledge base into points with spacing"""
        if not results:
            return None

        formatted_response = ""
        for i, result in enumerate(results[:10]):
            # Split the result into sentences
            sentences = result.split(". ")   # Split into sentences
            # Add a bullet point and spacing for each sentence
            for j, sentence in enumerate(sentences):
                sentence = sentence.strip()  # Remove leading/trailing spaces
                if sentence:  # Avoid empty sentences
                    formatted_response += f"\n• {sentence}.\n"  # Re-add the period
        return formatted_response

class ScraperManager:
    def __init__(self, scraper, knowledge_base, update_interval_hours=24):
        self.scraper = scraper
        self.knowledge_base = knowledge_base
        self.update_interval = update_interval_hours * 3600  # Convert to seconds
        
    def check_and_update(self):
        """Check if knowledge base needs updating and run scraper if necessary"""
        if (not self.knowledge_base.last_update or 
            (datetime.now() - self.knowledge_base.last_update).total_seconds() > self.update_interval):
            self.scraper.scrape()
            self.scraper.save_data(self.knowledge_base.data_file)
            self.knowledge_base.knowledge_base = self.knowledge_base.load_data()